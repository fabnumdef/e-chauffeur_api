import Router from 'koa-router';
import maskOutput from '../middlewares/mask-output';
import checkRights from '../middlewares/check-rights';

import CarModel from '../models/car-model';

const router = new Router();

router.post(
  '/',
  checkRights('canCreateCarModel'),
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
  checkRights('canListCarModel'),
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
  checkRights('canGetCarModel'),
  maskOutput,
  async (ctx) => {
    const { params: { id } } = ctx;
    ctx.body = await CarModel.findById(id).lean();
  },
);

router.patch(
  '/:id',
  checkRights('canEditCarModel'),
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
  checkRights('canRemoveCarModel'),
  async (ctx) => {
    const { params: { id } } = ctx;
    await CarModel.deleteOne({ _id: id });
    ctx.status = 204;
  },
);

export default router.routes();
