import Router from 'koa-router';
import maskOutput from '../../middlewares/mask-output';
import Campus from '../../models/campus';

const router = new Router();

router.get(
  '/',
  maskOutput,
  async (ctx) => {
    if (!ctx.query || !ctx.query.filters) {
      throw new Error('`filters` are required');
    }
    const { filters } = ctx.query;
    if (!filters.start || !filters.end) {
      throw new Error('`start` and `end` filters are required');
    }

    const start = new Date(filters.start);
    const end = new Date(filters.end);

    ctx.body = await Campus.findCars(ctx.params.campus_id, start, end);
  },
);

export default router.routes();
