import Router from 'koa-router';
import Campus from '../../models/campus';
import maskOutput from '../../middlewares/mask-output';
import { ensureThatFiltersExists } from '../../middlewares/query-helper';
import { checkCampusRights } from '../../middlewares/check-rights';
import { CAN_GET_CAMPUS_DRIVER, CAN_LIST_CAMPUS_DRIVER } from '../../models/rights';

const router = new Router();

router.get(
  '/date-interval',
  checkCampusRights(CAN_LIST_CAMPUS_DRIVER),
  maskOutput,
  ensureThatFiltersExists('start', 'end'),
  async (ctx) => {
    const start = new Date(ctx.query.filters.start);
    const end = new Date(ctx.query.filters.end);

    ctx.body = await Campus.findDriversInDateInterval(ctx.params.campus_id, start, end);
  },
);

router.get(
  '/',
  checkCampusRights(CAN_LIST_CAMPUS_DRIVER),
  maskOutput,
  async (ctx) => {
    ctx.body = await Campus.findDrivers(ctx.params.campus_id);
  },
);

router.get(
  '/:id',
  checkCampusRights(CAN_GET_CAMPUS_DRIVER),
  maskOutput,
  async (ctx) => {
    ctx.body = await Campus.findDriver(ctx.params.campus_id, ctx.params.id);
  },
);

export default router.routes();
