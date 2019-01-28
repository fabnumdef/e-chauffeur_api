import Router from 'koa-router';
import camelCase from 'lodash.camelcase';
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
