import Router from 'koa-router';
import maskOutput from '../middlewares/mask-output';
import checkRights from '../middlewares/check-rights';
import Role from '../models/role';

const router = new Router();

router.post(
  '/',
  checkRights('canCreateRole'),
  maskOutput,
  async (ctx) => {
    const { request: { body } } = ctx;

    if (await Role.findById(body.id)) {
      throw new Error('Role already exists.');
    }
    Object.assign(body, { _id: body.id });
    ctx.body = await Role.create(body);
  },
);

router.get(
  '/',
  checkRights('canListRole'),
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
  checkRights('canGetRole'),
  maskOutput,
  async (ctx) => {
    const { params: { id } } = ctx;
    ctx.body = await Role.findById(id).lean();
  },
);

router.patch(
  '/:id',
  checkRights('canEditRole'),
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
  checkRights('canRemoveRole'),
  async (ctx) => {
    const { params: { id } } = ctx;
    await Role.remove({ _id: id });
    ctx.status = 204;
  },
);

export default router.routes();
