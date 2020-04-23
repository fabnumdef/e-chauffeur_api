import isEmpty from 'lodash.isempty';
import Router from '@koa/router';
import Campus from '../../models/campus';
import maskOutput from '../../middlewares/mask-output';
import resolveRights from '../../middlewares/check-rights';
import {
  CAN_CREATE_CAMPUS_DRIVER,
  CAN_EDIT_CAMPUS_DRIVER,
  CAN_GET_CAMPUS_DRIVER,
  CAN_LIST_CAMPUS_DRIVER, CAN_LIST_CAMPUS_DRIVER_RIDE,
  CAN_REMOVE_CAMPUS_DRIVER,
} from '../../models/rights';
import User from '../../models/user';
import { ensureThatFiltersExists } from '../../middlewares/query-helper';
import { emitDriversSocketConnected } from '../../middlewares/drivers-socket-status';
import config from '../../services/config';
import contentNegociation from '../../middlewares/content-negociation';
import { ROLE_DRIVER_NAME } from '../../models/role';


const router = new Router();
const addDomainInError = (e) => [
  400,
  e.errors ? { whitelistDomains: config.get('whitelist_domains'), errors: e.errors } : e,
];

router.get(
  '/',
  resolveRights(CAN_LIST_CAMPUS_DRIVER),
  contentNegociation,
  maskOutput,
  async (ctx) => {
    let data;
    const { offset, limit } = ctx.parseRangePagination(User, { max: 1000 });
    const total = await Campus.countDrivers(ctx.params.campus_id);

    if ((ctx.query && ctx.query.filters)
      && (ctx.query.filters.start && ctx.query.filters.end)) {
      data = await Campus.findDriversInDateInterval(ctx.params.campus_id,
        {
          start: new Date(ctx.query.filters.start),
          end: new Date(ctx.query.filters.end),
        },
        { offset, limit },
        { onlyHeavyLicences: ctx.query.filters.onlyHeavyLicences });
    } else {
      data = await Campus.findDrivers(ctx.params.campus_id, { offset, limit });
    }

    ctx.setRangePagination(User, { total, offset, count: data.length });
    ctx.body = data;
  },
  emitDriversSocketConnected,
);

router.get(
  '/:id',
  resolveRights(CAN_GET_CAMPUS_DRIVER),
  maskOutput,
  async (ctx) => {
    ctx.body = await Campus.findDriver(ctx.params.campus_id, ctx.params.id);
  },
);

router.get(
  '/:driver_id/rides',
  resolveRights(CAN_LIST_CAMPUS_DRIVER_RIDE),
  maskOutput,
  ensureThatFiltersExists('status'),
  async (ctx) => {
    const { filters } = ctx.query;

    ctx.body = await Campus.findRidesWithStatus(ctx.params.driver_id, filters.status);
  },
);

router.post(
  '/',
  resolveRights(CAN_CREATE_CAMPUS_DRIVER),
  maskOutput,
  async (ctx) => {
    const { request: { body } } = ctx;

    const campus = await Campus.findById(ctx.params.campus_id, 'name').lean();
    const user = await User.findOne({ email: body.email });

    if (user) {
      if (!Array.isArray(user.roles)) {
        user.roles = [];
      }
      const roleIndex = user.roles.findIndex(({ role }) => role === ROLE_DRIVER_NAME);
      if (roleIndex < 0) {
        user.roles.push({
          role: ROLE_DRIVER_NAME,
          campuses: [campus],
        });
      } else {
        user.roles[roleIndex].campuses.push(campus);
      }

      ctx.body = await user.save();
      return;
    }

    if (!body.password) {
      delete body.password;
    }
    delete body.roles;
    Object.assign(body,
      {
        roles:
          [
            {
              role: ROLE_DRIVER_NAME,
              campuses: [campus],
            },
          ],
      });
    try {
      ctx.body = await User.create(body);
    } catch (e) {
      ctx.throw_and_log(...addDomainInError(e));
    }
  },
);

router.patch(
  '/:id',
  resolveRights(CAN_EDIT_CAMPUS_DRIVER),
  maskOutput,
  async (ctx) => {
    const { request: { body } } = ctx;

    const driver = await Campus.findDriver(ctx.params.campus_id, ctx.params.id);
    ctx.assert(!isEmpty(driver), 404, 'Driver not found.');

    if (!body.password) {
      delete body.password;
    }
    delete body.roles;
    driver.set(body);
    try {
      ctx.body = await driver.save();
    } catch (e) {
      ctx.throw_and_log(...addDomainInError(e));
    }
  },
);

router.del(
  '/:id',
  resolveRights(CAN_REMOVE_CAMPUS_DRIVER),
  async (ctx) => {
    const driver = await Campus.findDriver(ctx.params.campus_id, ctx.params.id);
    ctx.assert(!isEmpty(driver), 404, 'Driver not found.');
    driver.roles = driver.roles
      .map(({ role, campuses = [] }) => {
        if (role !== ROLE_DRIVER_NAME) {
          return { role, campuses };
        }
        return {
          role,
          campuses: campuses.filter(({ _id: id }) => (id !== ctx.params.campus_id)),
        };
      })
      .filter(({ role, campuses }) => (role !== ROLE_DRIVER_NAME || campuses.length > 0));
    ctx.body = await driver.save();
  },
);

export default router;
