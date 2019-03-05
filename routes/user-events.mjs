import Router from 'koa-router';
import maskOutput from '../middlewares/mask-output';
import addFilter from '../middlewares/add-filter';

import UserEvent from '../models/user-event';

const router = new Router();

router.post(
  '/',
  maskOutput,
  async (ctx) => {
    const { request: { body } } = ctx;

    if (await UserEvent.findById(body.id)) {
      throw new Error('UserEvent already exists.');
    }
    Object.assign(body, { _id: body.id });
    ctx.body = await UserEvent.create(body);
  },
);

router.get(
  '/',
  maskOutput,
  addFilter('user', 'user._id'),
  async (ctx) => {
    const { offset, limit } = ctx.parseRangePagination(UserEvent);
    const total = await UserEvent.countDocuments(ctx.filters);
    const data = await UserEvent.find(ctx.filters).skip(offset).limit(limit).lean();
    ctx.setRangePagination(UserEvent, { total, offset, count: data.length });

    ctx.body = data;
  },
);

router.get(
  '/:id',
  maskOutput,
  async (ctx) => {
    const { params: { id } } = ctx;
    ctx.body = await UserEvent.findById(id).lean();
  },
);

router.patch(
  '/:id',
  maskOutput,
  async (ctx) => {
    const { request: { body } } = ctx;

    const { params: { id } } = ctx;
    const userEvent = await UserEvent.findById(id);
    userEvent.set(body);
    ctx.body = await userEvent.save();
  },
);

router.del(
  '/:id',
  async (ctx) => {
    const { params: { id } } = ctx;
    await UserEvent.remove({ _id: id });
    ctx.status = 204;
  },
);

export default router.routes();
