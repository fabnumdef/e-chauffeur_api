import Router from 'koa-router';
import maskOutput from '../../middlewares/mask-output';

import Campus from '../../models/campus';
import { ensureThatFiltersExists } from '../../middlewares/query-helper';

const router = new Router();

router.get(
  '/',
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
  maskOutput,
  ensureThatFiltersExists('status'),
  async (ctx) => {
    const { filters } = ctx.query;

    ctx.body = await Campus.findRidesWithStatus(ctx.params.driver_id, filters.status);
  },
);

export default router.routes();
