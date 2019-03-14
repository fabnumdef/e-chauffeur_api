import Router from 'koa-router';
import camelCase from 'lodash.camelcase';

import maskOutput, { cleanObject } from '../middlewares/mask-output';
import contentNegociation from '../middlewares/content-negociation';

import Ride from '../models/ride';
import addFilter from '../middlewares/add-filter';
import { ensureThatFiltersExists } from '../middlewares/query-helper';

const router = new Router();

router.post(
  '/',
  maskOutput,
  async (ctx) => {
    const { request: { body } } = ctx;

    if (await Ride.findById(body.id)) {
      throw new Error('Ride already exists.');
    }
    const ride = await Ride.create(body);
    ctx.body = ride;
    ctx.app.io
      .in(`ride/${ride.id}`)
      .in(`campus/${ride.campus.id}`)
      .in(`driver/${ride.driver.id}`)
      .emit('rideUpdate', cleanObject(ctx.body));
  },
);

router.patch(
  '/:id',
  maskOutput,
  async (ctx) => {
    const { request: { body } } = ctx;

    const { params: { id } } = ctx;
    const ride = await Ride.findById(id);

    ride.set(body);
    await ride.save();
    ctx.body = ride;
    ctx.app.io
      .in(`ride/${ride.id}`)
      .in(`campus/${ride.campus.id}`)
      .in(`driver/${ride.driver.id}`)
      .emit('rideUpdate', cleanObject(ctx.body));
  },
);

router.get(
  '/',
  contentNegociation,
  maskOutput,
  ensureThatFiltersExists('start', 'end'),
  addFilter('campus', 'campus._id'),
  async (ctx) => {
    const { offset, limit } = ctx.parseRangePagination(Ride);
    const start = new Date(ctx.query.filters.start);
    const end = new Date(ctx.query.filters.end);

    const total = await Ride.countDocumentsWithin(start, end, ctx.filters);
    const data = await Ride.findWithin(start, end, ctx.filters).skip(offset).limit(limit).lean();
    ctx.setRangePagination(Ride, { total, offset, count: data.length });

    ctx.body = data;
  },
);

/**
 * Rights :
 * - Il the user is not logged in, but token provided as a filter is the right one
 */
router.get(
  '/:id',
  maskOutput,
  async (ctx) => {
    const { params: { id }, query: { token } } = ctx;
    const ride = await Ride.findById(Ride.castId(id));

    if (!ride.isAccessibleByAnonymous(token)) {
      throw new Error('User not authorized to fetch this ride');
    }
    if (!ride) {
      ctx.status = 404;
      return;
    }
    ctx.body = ride;
  },
);

/**
 * Rights :
 * - Il the user is not logged in, but token provided as a filter is the right one
 */
router.get(
  '/:id/position',
  maskOutput,
  async (ctx) => {
    const { params: { id }, query: { token } } = ctx;
    const ride = await Ride.findById(Ride.castId(id));

    if (!ride.isAccessibleByAnonymous(token)) {
      throw new Error('User not authorized to fetch this ride');
    }

    if (!ride) {
      ctx.status = 404;
      return;
    }

    const position = await ride.findDriverPosition(new Date());
    if (!position) {
      ctx.status = 404;
      return;
    }

    ctx.body = position;
  },
);

router.post(
  '/:id/:action',
  maskOutput,
  async (ctx) => {
    // @todo: rights - driver should be able to update status

    const { params: { id, action } } = ctx;
    const ride = await Ride.findById(id);
    if (!ride) {
      throw new Error('Ride not found');
    }
    if (!ride.can(action)) {
      throw new Error(`State violation : ride cannot switch to "${action}"`);
    }

    ride[camelCase(action)]();
    ctx.body = await ride.save();
    ctx.app.io
      .in(`ride/${ride.id}`)
      .in(`campus/${ride.campus.id}`)
      .in(`driver/${ride.driver.id}`)
      .emit('rideUpdate', cleanObject(ctx.body));
  },
);

export default router.routes();
