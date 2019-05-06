import Router from 'koa-router';
import maskOutput from '../middlewares/mask-output';
import checkRights from '../middlewares/check-rights';

import Phone from '../models/phone';

import {
  CAN_CREATE_PHONE,
  CAN_EDIT_PHONE,
  CAN_GET_PHONE,
  CAN_LIST_PHONE,
  CAN_REMOVE_PHONE,
} from '../models/rights';

const router = new Router();

router.get(
  '/',
  checkRights(CAN_LIST_PHONE),
  maskOutput,
  async (ctx) => {
    const { offset, limit } = ctx.parseRangePagination(Phone);
    const total = await Phone.countDocuments();
    const data = await Phone.find({}).skip(offset).limit(limit);
    ctx.setRangePagination(Phone, { total, offset, count: data.length });

    ctx.body = data;
  },
);

router.get(
  '/:id',
  checkRights(CAN_GET_PHONE),
  maskOutput,
  async (ctx) => {
    const { params: { id } } = ctx;
    ctx.body = await Phone.findById(id).lean();
  },
);

router.post(
  '/',
  checkRights(CAN_CREATE_PHONE),
  maskOutput,
  async (ctx) => {
    const { params: { id }, request: { body } } = ctx;

    if (await Phone.findById(id)) {
      ctx.throw(409, 'Phone already existing.');
    }

    ctx.body = await Phone.create(body);
  },
);


router.patch(
  '/:id',
  checkRights(CAN_EDIT_PHONE),
  maskOutput,
  async (ctx) => {
    const { params: { id }, request: { body } } = ctx;

    const phone = await Phone.findById(id);
    ctx.assert(phone, 404, 'Phone not found.');

    if (body.driver && (!body.driver._id || !body.driver.campus)) {
      delete body.driver;
      phone.driver = undefined;
    }

    phone.set(body);
    ctx.body = await phone.save();
  },
);

router.del(
  '/:id',
  checkRights(CAN_REMOVE_PHONE),
  async (ctx) => {
    const { params: { id } } = ctx;
    await Phone.remove({ _id: id });
    ctx.status = 204;
  },
);

export default router.routes();
