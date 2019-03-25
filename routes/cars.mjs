import Router from 'koa-router';
import maskOutput from '../middlewares/mask-output';
import addFilter from '../middlewares/add-filter';

import Car from '../models/car';
import checkRights from '../middlewares/check-rights';
import {
  CAN_CREATE_CAR, CAN_EDIT_CAR, CAN_GET_CAR, CAN_LIST_CAR, CAN_REMOVE_CAR,
} from '../models/rights';

const router = new Router();

router.post(
  '/',
  checkRights(CAN_CREATE_CAR),
  maskOutput,
  async (ctx) => {
    const { request: { body } } = ctx;

    if (await Car.findById(body.id)) {
      ctx.throw(409, 'Car already exists.');
    }

    Object.assign(body, { _id: body.id });
    ctx.body = await Car.create(body);
  },
);

router.get(
  '/',
  checkRights(CAN_LIST_CAR),
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
  checkRights(CAN_GET_CAR),
  maskOutput,
  async (ctx) => {
    const { params: { id } } = ctx;
    ctx.body = await Car.findById(id).lean();
  },
);

router.patch(
  '/:id',
  checkRights(CAN_EDIT_CAR),
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
  checkRights(CAN_REMOVE_CAR),
  async (ctx) => {
    const { params: { id } } = ctx;
    await Car.remove({ _id: id });
    ctx.status = 204;
  },
);

export default router.routes();
