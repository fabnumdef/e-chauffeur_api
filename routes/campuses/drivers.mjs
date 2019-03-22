import Router from 'koa-router';
import maskOutput from '../../middlewares/mask-output';

import Campus from '../../models/campus';
import { ensureThatFiltersExists } from '../../middlewares/query-helper';
import { checkCampusRights } from '../../middlewares/check-rights';
import { CAN_LIST_CAMPUS_DRIVER, CAN_LIST_CAMPUS_DRIVER_RIDE } from '../../models/rights';

const router = new Router();

router.get(
  '/',
  checkCampusRights(CAN_LIST_CAMPUS_DRIVER),
  maskOutput,
  ensureThatFiltersExists('start', 'end'),
  async (ctx) => {
    const start = new Date(ctx.query.filters.start);
    const end = new Date(ctx.query.filters.end);

    ctx.body = await Campus.findDrivers(ctx.params.campus_id, start, end);
  },
);

router.get(
  '/:driver_id/rides',
  checkCampusRights(CAN_LIST_CAMPUS_DRIVER_RIDE),
  maskOutput,
  ensureThatFiltersExists('status'),
  async (ctx) => {
    const { filters } = ctx.query;

    ctx.body = await Campus.findRidesWithStatus(ctx.params.driver_id, filters.status);
  },
);

export default router.routes();
