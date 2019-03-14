import Router from 'koa-router';
import maskOutput from '../middlewares/mask-output';
import checkRights from '../middlewares/check-rights';
import Campus from '../models/campus';
import driversRoutes from './campuses/drivers';
import driversPositionsRoutes from './campuses/drivers-positions';
import carsRoutes from './campuses/cars';
import statsRoutes from './campuses/stats';

const router = new Router();

router.use('/:campus_id/drivers', driversRoutes);
router.use('/:campus_id/drivers-positions', driversPositionsRoutes);
router.use('/:campus_id/cars', carsRoutes);
router.use('/:campus_id/stats', statsRoutes);

router.post(
  '/',
  checkRights('canCreateCampus'),
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
  checkRights('canListCampus'),
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
  '/infos',
  maskOutput,
  async (ctx) => {
    const maskAuthorized = ['id', 'informations'];
    let execQuery = false;
    let masks = [];

    if (ctx.query && ctx.query.mask) {
      masks = ctx.query.mask.split(',');
      maskAuthorized.forEach((m) => {
        if (masks.indexOf(m) !== -1) {
          execQuery = true;
        }
      });
    }

    if (execQuery) {
      ctx.body = await Campus.find({ _id: 'BSL' }).lean();
    } else {
      throw new Error('Mask forbidden given.');
    }
  }
);

router.get(
  '/:id',
  checkRights('canGetCampus'),
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
  checkRights('canEditCampus'),
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
  checkRights('canRemoveCampus'),
  async (ctx) => {
    const { params: { id } } = ctx;
    await Campus.remove({ _id: id });
    ctx.status = 204;
  },
);

export default router.routes();
