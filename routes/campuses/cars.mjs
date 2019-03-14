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

    ctx.body = await Campus.findCars(ctx.params.campus_id, start, end);
  },
);

export default router.routes();
