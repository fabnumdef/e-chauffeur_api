import Router from 'koa-router';
import maskOutput from '../middlewares/mask-output';

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

export default router.routes();
