import Router from 'koa-router';
import maskOutput from '../middlewares/mask-output';

import CarModel from '../models/car-model';

const router = new Router();

router.post(
  '/',
  maskOutput,
  async (ctx) => {
    const { request: { body } } = ctx;

    if (await CarModel.findById(body.id)) {
      throw new Error('CarModel already exists.');
    }
    Object.assign(body, { _id: body.id });
    ctx.body = await CarModel.create(body);
  },
);

router.get(
  '/',
  maskOutput,
  async (ctx) => {
    const { offset, limit } = ctx.parseRangePagination(CarModel);
    const total = await CarModel.countDocuments(ctx.filters);
    const data = await CarModel.find(ctx.filters).skip(offset).limit(limit).lean();
    ctx.setRangePagination(CarModel, { total, offset, count: data.length });

    ctx.body = data;
  },
);

router.get(
  '/:id',
  maskOutput,
  async (ctx) => {
    const { params: { id } } = ctx;
    ctx.body = await CarModel.findById(id).lean();
  },
);

router.patch(
  '/:id',
  maskOutput,
  async (ctx) => {
    const { request: { body } } = ctx;

    const { params: { id } } = ctx;
    const carModel = await CarModel.findById(id);
    carModel.set(body);
    ctx.body = await carModel.save();
  },
);

router.del(
  '/:id',
  async (ctx) => {
    const { params: { id } } = ctx;
    await CarModel.deleteOne({ _id: id });
    ctx.status = 204;
  },
);

export default router.routes();
