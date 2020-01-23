import isEmpty from 'lodash.isempty';
import Router from '@koa/router';
import Campus from '../../models/campus';
import maskOutput from '../../middlewares/mask-output';
import resolveRights from '../../middlewares/check-rights';
import {
  CAN_CREATE_CAMPUS_USER,
  CAN_EDIT_CAMPUS_USER,
  CAN_GET_CAMPUS_USER,
  CAN_LIST_CAMPUS_USER,
  CAN_REMOVE_CAMPUS_USER,
} from '../../models/rights';
import User from '../../models/user';
import config from '../../services/config';
import { csvToJson } from '../../middlewares/csv-to-json';
import contentNegociation from '../../middlewares/content-negociation';

const router = new Router();
const addDomainInError = (e) => [
  400,
  e.errors ? { whitelistDomains: config.get('whitelist_domains'), errors: e.errors } : e,
];

router.get(
  '/',
  resolveRights(CAN_LIST_CAMPUS_USER),
  contentNegociation,
  maskOutput,
  async (ctx) => {
    const { offset, limit } = ctx.parseRangePagination(User, { max: 30 });
    const total = await Campus.countUsers(ctx.params.campus_id);
    const data = await Campus.findUsers(ctx.params.campus_id, { offset, limit });
    ctx.setRangePagination(User, { total, offset, count: data.length });
    ctx.body = data;
  },
);

router.get(
  '/:id',
  resolveRights(CAN_GET_CAMPUS_USER),
  maskOutput,
  async (ctx) => {
    ctx.body = await Campus.findUser(ctx.params.campus_id, ctx.params.id);
    if (!ctx.body) {
      ctx.throw_and_log(404, `User "${ctx.params.id}" not found`)();
    }
  },
);

router.post(
  '/',
  resolveRights(CAN_CREATE_CAMPUS_USER),
  maskOutput,
  async (ctx) => {
    const { request: { body } } = ctx;
    const campus = await Campus.findById(ctx.params.campus_id, 'name').lean();

    if (!body.password) {
      delete body.password;
    }

    const emailO = { email: body.email };
    if (await User.findOne(emailO)) {
      ctx.throw_and_log(409, `User email ${body.email} already existing.`);
    }
    try {
      if (body.roles) {
        body.roles = body.roles.map(({ role }) => ({ role, campuses: [{ id: campus._id, name: campus.name }] }));
        const bodyWithoutRole = { ...body };
        delete bodyWithoutRole.roles;
        const user = new User(bodyWithoutRole);
        ctx.assert(
          user.checkRolesRightsIter(body.roles || [])
            .reduce(
              (acc, cur) => cur.reduce((a, c) => a || ctx.may(...[].concat(c)), !(cur.length > 0)) && acc,
              true,
            ),
          403,
          'You\'re not authorized to create this user',
        );
      } else {
        body.roles = [{
          role: 'ROLE_USER',
          campuses: [{ id: campus._id, name: campus.name }],
        }];
      }
      ctx.body = await User.create(body);
    } catch (e) {
      ctx.throw_and_log(...addDomainInError(e));
    }
    ctx.log(ctx.log.INFO, `${User.modelName} "${body.id}" has been created`);
  },
);

router.patch(
  '/:id',
  resolveRights(CAN_EDIT_CAMPUS_USER),
  maskOutput,
  async (ctx) => {
    const { request: { body } } = ctx;

    const campus = await Campus.findById(ctx.params.campus_id, 'name').lean();
    const user = await Campus.findUser(ctx.params.campus_id, ctx.params.id);
    ctx.assert(!isEmpty(user), 404, 'Driver not found.');

    if (!body.password) {
      delete body.password;
    }
    if (body.roles) {
      body.roles = body.roles.map(({ role }) => {
        const userRole = user.roles.find((r) => r.role === role);
        const campuses = userRole ? userRole.campuses : [];
        const r = {
          role,
        };
        if (campuses && campuses.length) {
          r.campuses = campuses.find((c) => c._id === campus._id) ? campuses
            : campuses.concat([{
              id: campus._id,
              name: campus.name,
            }]);
        } else {
          r.campuses = [{
            id: campus._id,
            name: campus.name,
          }];
        }
        return r;
      });
      ctx.assert(
        user.checkRolesRightsIter(body.roles || [])
          .reduce(
            (acc, cur) => cur.reduce((a, c) => a || ctx.may(...[].concat(c)), !(cur.length > 0)) && acc,
            true,
          ),
        403,
        'You\'re not authorized to change this role',
      );
    }
    user.set(body);
    try {
      ctx.body = await user.save();
    } catch (e) {
      ctx.throw_and_log(...addDomainInError(e));
    }
  },
);

router.del(
  '/:id',
  resolveRights(CAN_REMOVE_CAMPUS_USER),
  async (ctx) => {
    const user = await Campus.findUser(ctx.params.campus_id, ctx.params.id);
    ctx.assert(!isEmpty(user), 404, 'User not found.');
    /*
     @todo Refactor this when we will have something more generic to control rights,
     because it is not done anywhere in del request for now
     */
    ctx.assert(
      !user.roles || !user.roles.find(({ role }) => role === 'ROLE_SUPERADMIN' || role === 'ROLE_ADMIN'),
      403,
      'You\'re not authorized to delete this user',
    );
    await User.deleteOne({ _id: user.id });
    ctx.log(
      ctx.log.INFO,
      `${User.modelName} "${user.id}" has been removed`,
    );
    ctx.status = 204;
  },
);

router.post('/batch',
  resolveRights(CAN_CREATE_CAMPUS_USER),
  csvToJson,
  async (ctx, next) => {
    const { file, query: { campus } } = ctx;
    if (campus) {
      file.forEach((item) => {
        if (item.roles) {
          const hasCampus = item.roles.reduce((acc, role) => (
            role.campuses.filter(({ id }) => id === campus).length > 0 || acc
          ), false);
          if (!hasCampus) {
            ctx.throw_and_log(403, 'Campus does not match current one');
          }
        }
      });
    }
    await next();
  },
  async (ctx) => {
    await User.createFromCSV({ model: User, refs: ['email'], datas: ctx.file });
    ctx.log(ctx.log.INFO, 'User batch has been created');
    ctx.status = 204;
  });

export default router.routes();
