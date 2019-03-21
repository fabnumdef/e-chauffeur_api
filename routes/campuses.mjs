import Router from 'koa-router';
import maskOutput from '../middlewares/mask-output';
import checkRights, { restrictedFieldsInAnonymous } from '../middlewares/check-rights';
import Campus from '../models/campus';
import driversRoutes from './campuses/drivers';
import driversPositionsRoutes from './campuses/drivers-positions';
import carsRoutes from './campuses/cars';
import statsRoutes from './campuses/stats';
import {
  CAN_CREATE_CAMPUS, CAN_EDIT_CAMPUS, CAN_GET_CAMPUS, CAN_LIST_CAMPUS, CAN_REMOVE_CAMPUS,
} from '../models/rights';

const router = new Router();

router.use('/:campus_id/drivers', driversRoutes);
router.use('/:campus_id/drivers-positions', driversPositionsRoutes);
router.use('/:campus_id/cars', carsRoutes);
router.use('/:campus_id/stats', statsRoutes);

router.post(
  '/',
  checkRights(CAN_CREATE_CAMPUS),
  maskOutput,
  async (ctx) => {
    const { request: { body } } = ctx;

    if (await Campus.findById(body.id)) {
      ctx.throw(409, 'Campus already exists.');
    }
    Object.assign(body, { _id: body.id });
    ctx.body = await Campus.create(body);
  },
);

router.get(
  '/',
  restrictedFieldsInAnonymous('id,information', CAN_LIST_CAMPUS),
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
  checkRights(CAN_GET_CAMPUS),
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
  checkRights(CAN_EDIT_CAMPUS),
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
  checkRights(CAN_REMOVE_CAMPUS),
  async (ctx) => {
    const { params: { id } } = ctx;
    await Campus.remove({ _id: id });
    ctx.status = 204;
  },
);

export default router.routes();
