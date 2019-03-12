import Router from 'koa-router';
import jwt from 'koa-jwt';
import config from '../services/config';
import User from '../models/user';
import maskOutput from '../middlewares/mask-output';

const router = new Router();

router.post('/generate', maskOutput, async (ctx) => {
  const { request: { body } } = ctx;
  const user = await User.findOne({ email: body.email });

  if (!user) {
    ctx.throw(404, 'User not found.');
  }

  if (!(await user.comparePassword(body.password))) {
    ctx.throw(403, 'Username and password do not match.');
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
      throw new Error('User not found.');
    }
    ctx.body = { token: user.emitJWT() };
  },
);

router.get(
  '/user',
  maskOutput,
  jwt({ secret: config.get('token:secret') }),
  async (ctx) => {
    ctx.body = User.cleanObject(await User.findById(ctx.state.user.id).lean());
  },
);

router.get(
  '/user/campuses',
  maskOutput,
  jwt({ secret: config.get('token:secret') }),
  async (ctx) => {
    const u = await User.findById(ctx.state.user.id);
    ctx.body = await u.getCampusesAccessibles();
  },
);

export default router.routes();
