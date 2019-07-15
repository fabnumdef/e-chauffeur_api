import Router from 'koa-router';
import jwt from 'koa-jwt';
import config from '../services/config';
import User from '../models/user';
import Campus from '../models/campus';
import maskOutput from '../middlewares/mask-output';
import resolveRights from '../middlewares/check-rights';
import { CAN_LIST_ALL_CAMPUSES, CAN_LOGIN } from '../models/rights';

const router = new Router();

router.post('/generate', resolveRights(CAN_LOGIN), maskOutput, async (ctx) => {
  const { request: { body } } = ctx;
  const user = await User.findOne({ email: body.email });

  if (!user) {
    ctx.throw_and_log(404, `User "${body.email}" not found.`);
  }

  if (!(await user.comparePassword(body.password))) {
    ctx.throw_and_log(403, `Username and password do not match for user "${body.email}".`);
  }

  ctx.body = { token: user.emitJWT() };
});

router.post(
  '/renew',
  maskOutput,
  jwt({ secret: config.get('token:secret') }),
  async (ctx) => {
    const user = await User.findById(ctx.state.user.id);
    if (!user) {
      ctx.throw_and_log(404, `User "${ctx.state.user.id}" not found.`);
    }
    ctx.body = { token: user.emitJWT() };
  },
);

router.get(
  '/user',
  maskOutput,
  jwt({ secret: config.get('token:secret') }),
  async (ctx) => {
    const user = await User.findById(ctx.state.user.id).lean();
    if (!user) {
      ctx.throw_and_log(404, `User "${ctx.state.user.id}" not found.`);
    }
    ctx.body = User.cleanObject(user);
  },
);

router.get(
  '/user/campuses',
  maskOutput,
  jwt({ secret: config.get('token:secret') }),
  async (ctx) => {
    const u = await User.findById(ctx.state.user.id);
    if (ctx.may(CAN_LIST_ALL_CAMPUSES)) {
      ctx.body = await Campus.find();
    } else {
      ctx.body = await u.getCampusesAccessibles();
    }
  },
);

export default router.routes();
