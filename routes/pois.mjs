import Router from 'koa-router';
import maskOutput from '../middlewares/mask-output';

import Poi from '../models/poi';

const router = new Router();

router.post(
  '/',
  maskOutput,
  async (ctx) => {
    const { request: { body } } = ctx;

    if (await Poi.findById(body.id)) {
      throw new Error('Poi already exists.');
    }
    Object.assign(body, { _id: body.id });
    ctx.body = await Poi.create(body);
  },
);

router.get(
  '/',
  maskOutput,
  async (ctx) => {
    const searchParams = {};
    if (ctx.query && ctx.query.search) {
      searchParams.$or = [
        {
          _id: new RegExp(ctx.query.search, 'i'),
        },
        {
          name: new RegExp(ctx.query.search, 'i'),
        },
      ];
    }
    const { offset, limit } = ctx.parseRangePagination(Poi);
    const total = await Poi.countDocuments(searchParams);
    const data = await Poi.find(searchParams).skip(offset).limit(limit).lean();
    ctx.setRangePagination(Poi, { total, offset, count: data.length });

    ctx.body = data;
  },
);

router.get(
  '/:id',
  maskOutput,
  async (ctx) => {
    const { params: { id } } = ctx;
    ctx.body = await Poi.findById(id).lean();
  },
);

router.patch(
  '/:id',
  maskOutput,
  async (ctx) => {
    const { request: { body } } = ctx;

    const { params: { id } } = ctx;
    const poi = await Poi.findById(id);

    poi.set(body);
    ctx.body = await poi.save();
  },
);

router.del(
  '/:id',
  async (ctx) => {
    const { params: { id } } = ctx;
    await Poi.remove({ _id: id });
    ctx.status = 204;
  },
);

export default router.routes();
