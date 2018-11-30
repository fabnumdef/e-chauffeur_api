import Router from 'koa-router';
import maskOutput from '../middlewares/mask-output';

import User from '../models/user';

const router = new Router();

router.post(
  '/',
  maskOutput,
  async (ctx) => {
    const { request: { body } } = ctx;

    if (!body.password) {
      delete body.password;
    }

    if (await User.findOne({ email: body.email })) {
      throw new Error('User already exists.');
    }

    ctx.body = await User.create(body);
  },
);

router.get(
  '/',
  maskOutput,
  async (ctx) => {
    const { offset, limit } = ctx.parseRangePagination(User);
    const total = await User.countDocuments();
    const data = await User.find().skip(offset).limit(limit).lean();
    ctx.setRangePagination(User, { total, offset, count: data.length });

    ctx.body = data;
  },
);

router.get(
  '/:id',
  maskOutput,
  async (ctx) => {
    const { params: { id } } = ctx;
    const data = await User.findById(id).lean();

    ctx.body = User.cleanObject(data);
  },
);

router.patch(
  '/:id',
  maskOutput,
  async (ctx) => {
    const { request: { body } } = ctx;

    if (!body.password) {
      delete body.password;
    }

    const { params: { id } } = ctx;
    const user = await User.findById(id);
    user.set(body);
    ctx.body = await user.save();
  },
);

router.del(
  '/:id',
  async (ctx) => {
    const { params: { id } } = ctx;
    await User.remove({ _id: id });
    ctx.status = 204;
  },
);

export default router.routes();
