import Router from 'koa-router';
import maskOutput from '../../middlewares/mask-output';

import GeoTracking from '../../models/geo-tracking';

const router = new Router();

router.get(
  '/',
  maskOutput,
  async (ctx) => {
    ctx.body = await GeoTracking.getLatestPosition(ctx.params.campus_id);
  },
);

export default router.routes();
