import isEmpty from 'lodash.isempty';
import Router from 'koa-router';
import Campus from '../../models/campus';
import maskOutput from '../../middlewares/mask-output';
import { hasFilters } from '../../middlewares/query-helper';
import { checkCampusRights } from '../../middlewares/check-rights';
import {
  CAN_CREATE_CAMPUS_DRIVER,
  CAN_EDIT_CAMPUS_DRIVER,
  CAN_GET_CAMPUS_DRIVER,
  CAN_LIST_CAMPUS_DRIVER,
  CAN_REMOVE_CAMPUS_DRIVER,
} from '../../models/rights';
import User from '../../models/user';

const router = new Router();

router.get(
  '/',
  checkCampusRights(CAN_LIST_CAMPUS_DRIVER),
  maskOutput,
  hasFilters('dateInterval', 'start', 'end'),
  async (ctx) => {
    let data;
    const { offset, limit } = ctx.parseRangePagination(User);
    const total = await Campus.countDrivers(ctx.params.campus_id);

    switch (ctx.hasFilters) {
      case 'dateInterval':
        {
          const start = new Date(ctx.query.filters.start);
          const end = new Date(ctx.query.filters.end);
          data = await Campus.findDriversInDateInterval(ctx.params.campus_id,
            { start, end },
            { offset, limit });
        }
        break;
      default:
        data = await Campus.findDrivers(ctx.params.campus_id, { offset, limit });
    }

    ctx.setRangePagination(User, { total, offset, count: data.length });
    ctx.body = data;
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

    if (await User.findOne({ email: body.email })) {
      ctx.throw(409, 'User email already existing.');
    }

    if (!body.password) {
      delete body.password;
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

router.patch(
  '/:id',
  checkCampusRights(CAN_EDIT_CAMPUS_DRIVER),
  maskOutput,
  async (ctx) => {
    const { request: { body } } = ctx;

    const driver = await Campus.findDriver(ctx.params.campus_id, ctx.params.id);
    ctx.assert(!isEmpty(driver), 404, 'Driver not found.');

    if (!body.password) {
      delete body.password;
    }

    driver.set(body);
    ctx.body = await driver.save();
  },
);

router.del(
  '/:id',
  checkCampusRights(CAN_REMOVE_CAMPUS_DRIVER),
  async (ctx) => {
    const driver = await Campus.findDriver(ctx.params.campus_id, ctx.params.id);
    ctx.assert(!isEmpty(driver), 404, 'Driver not found.');

    driver.roles.forEach(
      (role, indexRole) => {
        if (role.role === 'ROLE_DRIVER') {
          role.campuses.forEach(
            (campuse, indexCampuse) => {
              if (campuse._id === ctx.params.campus_id) {
                driver.roles[indexRole].campuses.splice(indexCampuse, 1);
              }
            },
          );
        }
        if (role.campuses.length === 0) {
          driver.roles.splice(indexRole, 1);
        }
      },
    );

    ctx.body = await driver.save();
  },
);

export default router.routes();
