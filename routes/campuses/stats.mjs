import Router from 'koa-router';
import mask from 'json-mask';
import maskOutput from '../../middlewares/mask-output';
import Campus from '../../models/campus';
import { ensureThatFiltersExists } from '../../middlewares/query-helper';
import resolveRights from '../../middlewares/check-rights';
import { CAN_GET_CAMPUS_STATS } from '../../models/rights';

const router = new Router();

const REQUESTABLE = {
  total: 'total',
  categories: 'categories',
};

router.get(
  '/',
  resolveRights(CAN_GET_CAMPUS_STATS),
  maskOutput,
  ensureThatFiltersExists('start', 'end'),
  async (ctx) => {
    const start = new Date(ctx.query.filters.start);
    const end = new Date(ctx.query.filters.end);

    const requested = Object.keys(mask(
      Object.values(REQUESTABLE).reduce((acc, curr) => Object.assign(acc, { [curr]: null }), {}),
      (ctx.query || {}).mask || ',',
    ));
    ctx.body = (await Promise.all(requested.map(async (r) => {
      let v = null;
      switch (r) {
        case REQUESTABLE.total:
          v = await Campus.countRides(ctx.params.campus_id, start, end);
          break;
        case REQUESTABLE.categories:
          v = await Campus.aggregateRidesByCategory(ctx.params.campus_id, start, end);
          break;
        default:
      }
      return { [r]: v };
    }))).reduce((acc, curr) => Object.assign(acc, curr), {});
  },
);

export default router.routes();
