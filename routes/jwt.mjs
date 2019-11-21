import Router from 'koa-router';
import jwt from 'koa-jwt';
import config from '../services/config';
import User, { ExpiredPasswordError } from '../models/user';
import Campus from '../models/campus';
import maskOutput from '../middlewares/mask-output';
import resolveRights from '../middlewares/check-rights';
import { CAN_LIST_ALL_CAMPUSES, CAN_LOGIN } from '../models/rights';

const router = new Router();

router.post('/generate', resolveRights(CAN_LOGIN), maskOutput, async (ctx) => {
  const { request: { body } } = ctx;
  const user = await User.findOne({ email: body.email });

  if (!body.password && !body.token) {
    ctx.throw_and_log(400, 'To generate a JWT, token or password are required.');
  }

  if (!user
  || (body.password && !(await user.comparePassword(body.password)))
  || (body.token && !(await user.compareResetToken(body.token, body.email)))) {
    ctx.throw_and_log(403, `Username and password do not match for user "${body.email}".`);
  }

  try {
    ctx.body = { token: user.emitJWT(!!body.password) };
  } catch (e) {
    if (e instanceof ExpiredPasswordError) {
      ctx.throw_and_log(401, 'Password expired');
    }
    throw e;
  }
});

router.post(
  '/renew',
  maskOutput,
  jwt({ secret: config.get('token:secret') }),
  async (ctx) => {
    if (!ctx.state.user.isRenewable) {
      ctx.throw_and_log(403, 'Token not renewable.');
    }
    const user = await User.findById(ctx.state.user.id);
    if (!user) {
      ctx.throw_and_log(404, `User "${ctx.state.user.id}" not found.`);
    }
    try {
      ctx.body = { token: user.emitJWT() };
    } catch (e) {
      if (e instanceof ExpiredPasswordError) {
        ctx.throw_and_log(401, 'Password expired');
      }
      throw e;
    }
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
    ctx.body = User.cleanObject(user, { virtuals: true });
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
