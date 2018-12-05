import Router from 'koa-router';
import maskOutput from '../middlewares/mask-output';

import Ride from '../models/ride';

const router = new Router();

router.post(
  '/',
  maskOutput,
  async (ctx) => {
    const { request: { body } } = ctx;

    if (await Ride.findById(body.id)) {
      throw new Error('Ride already exists.');
    }
    ctx.body = await Ride.create(body);
  },
);

export default router.routes();
