import Router from 'koa-router';
import mask from 'json-mask';
import maskOutput from '../../middlewares/mask-output';
import Campus from '../../models/campus';
import { ensureThatFiltersExists } from '../../middlewares/query-helper';

const router = new Router();
const REQUESTABLE = ['total'];

router.get(
  '/',
  maskOutput,
  ensureThatFiltersExists('start', 'end'),
  async (ctx) => {
    const start = new Date(ctx.query.filters.start);
    const end = new Date(ctx.query.filters.end);

    const requested = Object.keys(mask(
      REQUESTABLE.reduce((acc, curr) => Object.assign(acc, { [curr]: null }), {}),
      (ctx.query || {}).mask || ',',
    ));
    ctx.body = (await Promise.all(requested.map(async (r) => {
      let v = null;
      switch (r) {
        case 'total':
          v = await Campus.countRides(ctx.params.campus_id, start, end);
          break;
        default:
      }
      return { [r]: v };
    }))).reduce((acc, curr) => Object.assign(acc, curr), {});
  },
);

export default router.routes();
