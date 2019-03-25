import Router from 'koa-router';
import maskOutput from '../middlewares/mask-output';
import addFilter from '../middlewares/add-filter';

import CarEvent from '../models/car-event';
import checkRights from '../middlewares/check-rights';
import {
  CAN_CREATE_CAR_EVENT,
  CAN_EDIT_CAR_EVENT,
  CAN_GET_CAR_EVENT,
  CAN_LIST_CAR_EVENT,
  CAN_REMOVE_CAR_EVENT,
} from '../models/rights';

const router = new Router();

router.post(
  '/',
  checkRights(CAN_CREATE_CAR_EVENT),
  maskOutput,
  async (ctx) => {
    const { request: { body } } = ctx;

    if (await CarEvent.findById(body.id)) {
      ctx.throw(409, 'CarEvent already exists.');
    }
    Object.assign(body, { _id: body.id });
    ctx.body = await CarEvent.create(body);
  },
);

router.get(
  '/',
  checkRights(CAN_LIST_CAR_EVENT),
  maskOutput,
  addFilter('car', 'car._id'),
  async (ctx) => {
    const { offset, limit } = ctx.parseRangePagination(CarEvent);
    const total = await CarEvent.countDocuments(ctx.filters);
    const data = await CarEvent.find(ctx.filters).skip(offset).limit(limit).lean();
    ctx.setRangePagination(CarEvent, { total, offset, count: data.length });

    ctx.body = data;
  },
);

router.get(
  '/:id',
  checkRights(CAN_GET_CAR_EVENT),
  maskOutput,
  async (ctx) => {
    const { params: { id } } = ctx;
    ctx.body = await CarEvent.findById(id).lean();
  },
);

router.patch(
  '/:id',
  checkRights(CAN_EDIT_CAR_EVENT),
  maskOutput,
  async (ctx) => {
    const { request: { body } } = ctx;

    const { params: { id } } = ctx;
    const carEvent = await CarEvent.findById(id);
    carEvent.set(body);
    ctx.body = await carEvent.save();
  },
);

router.del(
  '/:id',
  checkRights(CAN_REMOVE_CAR_EVENT),
  async (ctx) => {
    const { params: { id } } = ctx;
    await CarEvent.remove({ _id: id });
    ctx.status = 204;
  },
);

export default router.routes();
