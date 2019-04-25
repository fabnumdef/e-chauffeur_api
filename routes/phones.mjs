import Router from 'koa-router';
import maskOutput from '../middlewares/mask-output';

import Phone from '../models/phone';

const router = new Router();

router.get(
  '/',
  maskOutput,
  async (ctx) => {
    const { offset, limit } = ctx.parseRangePagination(Phone);
    const total = await Phone.countDocuments();
    const data = await Phone.find({}).skip(offset).limit(limit).lean();
    ctx.setRangePagination(Phone, { total, offset, count: data.length });

    ctx.body = data;
  },
);

router.get(
  '/:id',
  maskOutput,
  async (ctx) => {
    const { params: { id } } = ctx;
    ctx.body = await Phone.findById(id).lean();
  },
);

router.post(
  '/',
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
  maskOutput,
  async (ctx) => {
    const { params: { id }, request: { body } } = ctx;

    const phone = await Phone.findById(id);
    ctx.assert(phone, 404, 'Phone not found.');


    phone.set(body);
    ctx.body = await phone.save();
  },
);

router.del(
  '/:id',
  async (ctx) => {
    const { params: { id } } = ctx;
    await Phone.remove({ _id: id });
    ctx.status = 204;
  },
);

export default router.routes();
