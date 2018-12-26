import Router from 'koa-router';
import maskOutput from '../middlewares/mask-output';
import addFilter from '../middlewares/add-filter';

import Category from '../models/category';

const router = new Router();

router.post(
  '/',
  maskOutput,
  async (ctx) => {
    const { request: { body } } = ctx;

    if (await Category.findById(body.id)) {
      throw new Error('Category already exists.');
    }
    Object.assign(body, { _id: body.id });
    ctx.body = await Category.create(body);
  },
);

router.get(
  '/',
  maskOutput,
  addFilter('campus', 'campus._id'),
  async (ctx) => {
    const { offset, limit } = ctx.parseRangePagination(Category);
    const total = await Category.countDocuments(ctx.filters);
    const data = await Category.find(ctx.filters).skip(offset).limit(limit).lean();
    ctx.setRangePagination(Category, { total, offset, count: data.length });

    ctx.body = data;
  },
);

router.get(
  '/:id',
  maskOutput,
  async (ctx) => {
    const { params: { id } } = ctx;
    ctx.body = await Category.findById(id).lean();
  },
);

router.patch(
  '/:id',
  maskOutput,
  async (ctx) => {
    const { request: { body } } = ctx;

    const { params: { id } } = ctx;
    const category = await Category.findById(id);
    category.set(body);
    ctx.body = await category.save();
  },
);

router.del(
  '/:id',
  async (ctx) => {
    const { params: { id } } = ctx;
    await Category.remove({ _id: id });
    ctx.status = 204;
  },
);

export default router.routes();
