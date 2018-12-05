import Router from 'koa-router';
import maskOutput from '../middlewares/mask-output';

import Campus from '../models/campus';

const router = new Router();

router.post(
  '/',
  maskOutput,
  async (ctx) => {
    const { request: { body } } = ctx;

    if (await Campus.findById(body.id)) {
      throw new Error('Campus already exists.');
    }
    Object.assign(body, { _id: body.id });
    ctx.body = await Campus.create(body);
  },
);

router.get(
  '/',
  maskOutput,
  async (ctx) => {
    const searchParams = {};
    if (ctx.query && ctx.query.search) {
      searchParams.$text = { $search: ctx.query.search };
    }
    const { offset, limit } = ctx.parseRangePagination(Campus);
    const total = await Campus.countDocuments();
    const data = await Campus.find(searchParams).skip(offset).limit(limit).lean();
    ctx.setRangePagination(Campus, { total, offset, count: data.length });

    ctx.body = data;
  },
);

router.get(
  '/:id',
  maskOutput,
  async (ctx) => {
    const { params: { id } } = ctx;
    const campus = await Campus.findById(id).lean();
    if (!campus) {
      ctx.status = 404;
      return;
    }
    ctx.body = campus;
  },
);

router.patch(
  '/:id',
  maskOutput,
  async (ctx) => {
    const { request: { body } } = ctx;
    const { params: { id } } = ctx;
    const campus = await Campus.findById(id);
    campus.set(body);
    ctx.body = await campus.save();
  },
);

router.del(
  '/:id',
  async (ctx) => {
    const { params: { id } } = ctx;
    await Campus.remove({ _id: id });
    ctx.status = 204;
  },
);

export default router.routes();
