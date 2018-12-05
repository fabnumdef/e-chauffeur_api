import Router from 'koa-router';
import maskOutput from '../middlewares/mask-output';
import addFilter from '../middlewares/add-filter';

import Car from '../models/car';

const router = new Router();

router.post(
  '/',
  maskOutput,
  async (ctx) => {
    const { request: { body } } = ctx;

    if (await Car.findById(body.id)) {
      throw new Error('Car already exists.');
    }
    Object.assign(body, { _id: body.id });
    ctx.body = await Car.create(body);
  },
);

router.get(
  '/',
  maskOutput,
  addFilter('campus', 'campus._id'),
  async (ctx) => {
    const { offset, limit } = ctx.parseRangePagination(Car);
    const total = await Car.countDocuments(ctx.filters);
    const data = await Car.find(ctx.filters).skip(offset).limit(limit).lean();
    ctx.setRangePagination(Car, { total, offset, count: data.length });

    ctx.body = data;
  },
);

router.get(
  '/:id',
  maskOutput,
  async (ctx) => {
    const { params: { id } } = ctx;
    ctx.body = await Car.findById(id).lean();
  },
);

router.patch(
  '/:id',
  maskOutput,
  async (ctx) => {
    const { request: { body } } = ctx;

    const { params: { id } } = ctx;
    const car = await Car.findById(id);
    car.set(body);
    ctx.body = await car.save();
  },
);

router.del(
  '/:id',
  async (ctx) => {
    const { params: { id } } = ctx;
    await Car.remove({ _id: id });
    ctx.status = 204;
  },
);

export default router.routes();
