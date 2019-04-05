import Router from 'koa-router';
import Campus from '../../models/campus';
import maskOutput from '../../middlewares/mask-output';
import { ensureThatFiltersExists } from '../../middlewares/query-helper';
import { checkCampusRights } from '../../middlewares/check-rights';
import {
  CAN_CREATE_CAMPUS_DRIVER, CAN_GET_CAMPUS_DRIVER, CAN_LIST_CAMPUS_DRIVER,
} from '../../models/rights';
import User from '../../models/user';

const router = new Router();

router.get(
  '/date-interval',
  checkCampusRights(CAN_LIST_CAMPUS_DRIVER),
  maskOutput,
  ensureThatFiltersExists('start', 'end'),
  async (ctx) => {
    const start = new Date(ctx.query.filters.start);
    const end = new Date(ctx.query.filters.end);

    ctx.body = await Campus.findDriversInDateInterval(ctx.params.campus_id, start, end);
  },
);

router.get(
  '/',
  checkCampusRights(CAN_LIST_CAMPUS_DRIVER),
  maskOutput,
  async (ctx) => {
    ctx.body = await Campus.findDrivers(ctx.params.campus_id);
  },
);

router.get(
  '/:id',
  checkCampusRights(CAN_GET_CAMPUS_DRIVER),
  maskOutput,
  async (ctx) => {
    ctx.body = await Campus.findDriver(ctx.params.campus_id, ctx.params.id);
  },
);

router.post(
  '/',
  checkCampusRights(CAN_CREATE_CAMPUS_DRIVER),
  maskOutput,
  async (ctx) => {
    const { request: { body } } = ctx;
    if (!body.password) {
      delete body.password;
    }
    if (await User.findOne({ email: body.email })) {
      ctx.throw(409, 'User email already existing.');
    }

    const campus = await Campus.findById(ctx.params.campus_id, 'name').lean();
    Object.assign(body,
      {
        roles:
          [
            {
              role: 'ROLE_DRIVER',
              campuses: [campus],
            },
          ],
      });

    ctx.body = await User.create(body);
  },
);

export default router.routes();
