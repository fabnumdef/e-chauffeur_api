import Router from 'koa-router';
import camelCase from 'lodash.camelcase';
import Json2csv from 'json2csv';

import maskOutput, { cleanObject } from '../middlewares/mask-output';

import Ride from '../models/ride';
import addFilter from '../middlewares/add-filter';

const router = new Router();

router.post(
  '/',
  maskOutput,
  async (ctx) => {
    const { request: { body } } = ctx;

    if (await Ride.findById(body.id)) {
      throw new Error('Ride already exists.');
    }
    ctx.body = await Ride.create(body);
    ctx.app.io.emit('rideUpdate', cleanObject(ctx.body));
  },
);

router.get(
  '/',
  maskOutput,
  addFilter('campus', 'campus._id'),
  async (ctx) => {
    const { offset, limit } = ctx.parseRangePagination(Ride);
    const { filters } = ctx.query;
    if (!filters.start || !filters.end) {
      throw new Error('`start` and `end` filters are required');
    }

    const start = new Date(filters.start);
    const end = new Date(filters.end);

    const total = await Ride.countDocumentsWithin(start, end, ctx.filters);
    const data = await Ride.findWithin(start, end, ctx.filters).skip(offset).limit(limit).lean();
    ctx.setRangePagination(Ride, { total, offset, count: data.length });

    ctx.body = data;
  },
);

router.get(
  '/export',
  maskOutput,
  addFilter('campus', 'campus._id'),
  async (ctx) => {
    const { filters } = ctx.query;
    const start = new Date(filters.start);
    const end = new Date(filters.end);
    const data = await Ride.findWithin(start, end, ctx.filters).lean();
    const Json2csvParser = Json2csv.Parser;

    try {
      const parser = new Json2csvParser( { flatten: true });
      const csv = parser.parse(data);
      ctx.type = 'csv';
      ctx.body = csv;
    } catch (err) {
      ctx.status = 500;
      throw new Error('An error was occured : ' + err.message);
    }
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
    ctx.app.io.emit('rideUpdate', cleanObject(ctx.body));
  },
);

export default router.routes();
