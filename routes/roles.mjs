import Router from 'koa-router';
import maskOutput from '../middlewares/mask-output';
import checkRights from '../middlewares/check-rights';
import Role from '../models/role';
import {
  CAN_CREATE_ROLE, CAN_EDIT_ROLE, CAN_GET_ROLE, CAN_LIST_ROLE, CAN_REMOVE_ROLE,
} from '../models/rights';

const router = new Router();

router.post(
  '/',
  checkRights(CAN_CREATE_ROLE),
  maskOutput,
  async (ctx) => {
    const { request: { body } } = ctx;

    if (await Role.findById(body.id)) {
      ctx.throw(409, 'Role already exists.');
    }
    Object.assign(body, { _id: body.id });
    ctx.body = await Role.create(body);
  },
);

router.get(
  '/',
  checkRights(CAN_LIST_ROLE),
  maskOutput,
  async (ctx) => {
    const { offset, limit } = ctx.parseRangePagination(Role);
    const total = await Role.countDocuments();
    const data = await Role.find().skip(offset).limit(limit).lean();
    ctx.setRangePagination(Role, { total, offset, count: data.length });

    ctx.body = data;
  },
);

router.get(
  '/:id',
  checkRights(CAN_GET_ROLE),
  maskOutput,
  async (ctx) => {
    const { params: { id } } = ctx;
    ctx.body = await Role.findById(id).lean();
  },
);

router.patch(
  '/:id',
  checkRights(CAN_EDIT_ROLE),
  maskOutput,
  async (ctx) => {
    const { request: { body } } = ctx;

    const { params: { id } } = ctx;
    const role = await Role.findById(id);
    role.set(body);
    ctx.body = await role.save();
  },
);

router.del(
  '/:id',
  checkRights(CAN_REMOVE_ROLE),
  async (ctx) => {
    const { params: { id } } = ctx;
    await Role.remove({ _id: id });
    ctx.status = 204;
  },
);

export default router.routes();
