import Router from 'koa-router';
import mask from 'json-mask';
import maskOutput from '../../middlewares/mask-output';
import Campus from '../../models/campus';

const router = new Router();
const REQUESTABLE = ['total'];

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
