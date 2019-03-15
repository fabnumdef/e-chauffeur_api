import Router from 'koa-router';
import maskOutput from '../middlewares/mask-output';
import addFilter from '../middlewares/add-filter';
import checkRights from '../middlewares/check-rights';
import Category from '../models/category';
import {
  CAN_CREATE_CATEGORY,
  CAN_EDIT_CATEGORY,
  CAN_GET_CATEGORY,
  CAN_LIST_CATEGORY,
  CAN_REMOVE_CATEGORY,
} from '../models/rights';

const router = new Router();

router.post(
  '/',
  checkRights(CAN_CREATE_CATEGORY),
  maskOutput,
  async (ctx) => {
    const { request: { body } } = ctx;

    if (await Category.findById(body.id)) {
      ctx.throw(409, 'Category already exists.');
    }
    Object.assign(body, { _id: body.id });
    ctx.body = await Category.create(body);
  },
);

router.get(
  '/',
  checkRights(CAN_LIST_CATEGORY),
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
  checkRights(CAN_GET_CATEGORY),
  maskOutput,
  async (ctx) => {
    const { params: { id } } = ctx;
    ctx.body = await Category.findById(id).lean();
  },
);

router.patch(
  '/:id',
  checkRights(CAN_EDIT_CATEGORY),
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
  checkRights(CAN_REMOVE_CATEGORY),
  async (ctx) => {
    const { params: { id } } = ctx;
    await Category.remove({ _id: id });
    ctx.status = 204;
  },
);

export default router.routes();
