import Router from 'koa-router';
import maskOutput from '../middlewares/mask-output';
import checkRights from '../middlewares/check-rights';

import CarModel from '../models/car-model';
import {
  CAN_CREATE_CAR_MODEL,
  CAN_EDIT_CAR_MODEL,
  CAN_GET_CAR_MODEL,
  CAN_LIST_CAR_MODEL,
  CAN_REMOVE_CAR_MODEL,
} from '../models/rights';

const router = new Router();

router.post(
  '/',
  checkRights(CAN_CREATE_CAR_MODEL),
  maskOutput,
  async (ctx) => {
    const { request: { body } } = ctx;

    if (await CarModel.findById(body.id)) {
      ctx.throw(409, 'CarModel already exists.');
    }
    Object.assign(body, { _id: body.id });
    ctx.body = await CarModel.create(body);
  },
);

router.get(
  '/',
  checkRights(CAN_LIST_CAR_MODEL),
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
  checkRights(CAN_GET_CAR_MODEL),
  maskOutput,
  async (ctx) => {
    const { params: { id } } = ctx;
    ctx.body = await CarModel.findById(id).lean();
  },
);

router.patch(
  '/:id',
  checkRights(CAN_EDIT_CAR_MODEL),
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
  checkRights(CAN_REMOVE_CAR_MODEL),
  async (ctx) => {
    const { params: { id } } = ctx;
    await CarModel.deleteOne({ _id: id });
    ctx.status = 204;
  },
);

export default router.routes();
