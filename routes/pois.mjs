import Router from 'koa-router';
import maskOutput from '../middlewares/mask-output';

import Poi from '../models/poi';
import { checkRightsOrLocalRights } from '../middlewares/check-rights';
import {
  CAN_CREATE_POI,
  CAN_CREATE_POI_LOCAL,
  CAN_EDIT_POI,
  CAN_EDIT_POI_LOCAL,
  CAN_GET_POI,
  CAN_GET_POI_LOCAL,
  CAN_LIST_POI,
  CAN_LIST_POI_LOCAL,
  CAN_REMOVE_POI,
  CAN_REMOVE_POI_LOCAL,
} from '../models/rights';
import addFilter from '../middlewares/add-filter';

const router = new Router();

router.post(
  '/',
  checkRightsOrLocalRights([CAN_CREATE_POI], [CAN_CREATE_POI_LOCAL]),
  maskOutput,
  async (ctx) => {
    const { request: { body } } = ctx;

    if (await Poi.findById(body.id)) {
      ctx.throw(409, 'Poi already exists.');
    }
    Object.assign(body, { _id: body.id });
    ctx.body = await Poi.create(body);
  },
);

router.get(
  '/',
  checkRightsOrLocalRights([CAN_LIST_POI], [CAN_LIST_POI_LOCAL]),
  maskOutput,
  addFilter('campus', 'campus._id'),
  async (ctx) => {
    const searchParams = { ...ctx.filters };
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
    ctx.setRangePagination(Poi, {
      total,
      offset,
      count: data.length,
      limit,
    });

    ctx.body = data;
  },
);

router.get(
  '/:id',
  checkRightsOrLocalRights([CAN_GET_POI], [CAN_GET_POI_LOCAL]),
  maskOutput,
  async (ctx) => {
    const { params: { id } } = ctx;
    ctx.body = await Poi.findById(id).lean();
  },
);

router.patch(
  '/:id',
  checkRightsOrLocalRights([CAN_EDIT_POI], [CAN_EDIT_POI_LOCAL]),
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
  checkRightsOrLocalRights([CAN_REMOVE_POI], [CAN_REMOVE_POI_LOCAL]),
  async (ctx) => {
    const { params: { id } } = ctx;
    await Poi.remove({ _id: id });
    ctx.status = 204;
  },
);

export default router.routes();
