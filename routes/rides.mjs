import Router from 'koa-router';
import camelCase from 'lodash.camelcase';
import { CANCELED_STATUSES, DELIVERED } from '../models/status';

import maskOutput, { cleanObject } from '../middlewares/mask-output';
import contentNegociation from '../middlewares/content-negociation';
import checkRights from '../middlewares/check-rights';

import Ride from '../models/ride';
import addFilter from '../middlewares/add-filter';
import { ensureThatFiltersExists } from '../middlewares/query-helper';
import {
  CAN_CREATE_RIDE,
  CAN_EDIT_RIDE,
  CAN_EDIT_RIDE_STATUS,
  CAN_GET_RIDE,
  CAN_GET_RIDE_POSITION,
  CAN_LIST_RIDE,
} from '../models/rights';

const router = new Router();

function ioEmit(ctx, data, eventName = '', rooms = []) {
  let { app: { io } } = ctx;
  rooms.forEach((room) => {
    io = io.in(room);
  });
  io.emit(eventName, data);
}

router.post(
  '/',
  checkRights(CAN_CREATE_RIDE),
  maskOutput,
  async (ctx) => {
    const { request: { body } } = ctx;
    const ride = await Ride.create(body);
    ctx.body = ride;
    ioEmit(ctx, cleanObject(ctx.body), 'rideUpdate', [
      `ride/${ride.id}`,
      `campus/${ride.campus.id}`,
      `driver/${ride.driver.id}`,
    ]);
  },
);

router.patch(
  '/:id',
  checkRights(CAN_EDIT_RIDE),
  maskOutput,
  async (ctx) => {
    const { request: { body } } = ctx;

    const { params: { id } } = ctx;
    const ride = await Ride.findById(id);
    const previousDriverId = ride.driver.id.toString();

    ride.set(body);
    await ride.save();
    ctx.body = ride;
    const rooms = [
      `ride/${ride.id}`,
      `campus/${ride.campus.id}`,
      `driver/${ride.driver.id}`,
    ];
    if (body.driver.id !== previousDriverId) {
      rooms.push(`driver/${previousDriverId}`);
    }
    ioEmit(ctx, cleanObject(ctx.body), 'rideUpdate', rooms);
  },
);

router.get(
  '/',
  checkRights(CAN_LIST_RIDE),
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
  checkRights(CAN_GET_RIDE),
  maskOutput,
  async (ctx) => {
    const { params: { id }, query: { token } } = ctx;
    const ride = await Ride.findById(Ride.castId(id));

    if (!ride.isAccessibleByAnonymous(token)) {
      ctx.throw(401, 'User not authorized to fetch this ride');
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
  checkRights(CAN_GET_RIDE_POSITION),
  maskOutput,
  async (ctx) => {
    const { params: { id }, query: { token } } = ctx;
    const ride = await Ride.findById(Ride.castId(id));

    if (!ride.isAccessibleByAnonymous(token)) {
      ctx.throw(401, 'User not authorized to fetch this ride');
    }

    if (!ride) {
      ctx.status = 404;
      return;
    }

    if (ride.status === DELIVERED || CANCELED_STATUSES.indexOf(ride.status) !== -1) {
      ctx.throw(417, 'Ride cancelled or delivred');
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
  checkRights(CAN_EDIT_RIDE_STATUS),
  maskOutput,
  async (ctx) => {
    // @todo: rights - driver should be able to update status

    const { params: { id, action } } = ctx;
    const ride = await Ride.findById(id);
    if (!ride) {
      ctx.throw(404, 'Ride not found');
    }
    if (!ride.can(action)) {
      ctx.throw(400, `State violation : ride cannot switch to "${action}"`);
    }

    ride[camelCase(action)]();
    ctx.body = await ride.save();
    ioEmit(ctx, cleanObject(ctx.body), 'rideUpdate', [
      `ride/${ride.id}`,
      `campus/${ride.campus.id}`,
      `driver/${ride.driver.id}`,
    ]);
  },
);

export default router.routes();
