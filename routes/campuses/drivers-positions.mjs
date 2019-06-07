import Router from 'koa-router';
import maskOutput, { cleanObject } from '../../middlewares/mask-output';

import GeoTracking from '../../models/geo-tracking';
import Campus from '../../models/campus';

const router = new Router();

router.get(
  '/',
  maskOutput,
  async (ctx) => {
    const drivers = await Campus.findDrivers(ctx.params.campus_id);
    const positions = await GeoTracking.getLatestPosition(drivers, new Date());
    ctx.body = drivers.map(
      driver => ({
        ...cleanObject(driver),
        ...(positions.find(p => p._id.equals(driver._id)) || {}),
      }),
    );
  },
);

export default router.routes();
