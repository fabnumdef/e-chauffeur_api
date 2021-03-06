import Router from '@koa/router';
import mask from 'json-mask';
import maskOutput from '../../middlewares/mask-output';
import { ensureThatFiltersExists } from '../../middlewares/query-helper';
import resolveRights from '../../middlewares/check-rights';
import { CAN_GET_CAMPUS_STATS } from '../../models/rights';
import statAggregator, { REQUESTABLE } from '../../helpers/stats-aggregator';

const router = new Router();

router.get(
  '/',
  resolveRights(CAN_GET_CAMPUS_STATS),
  maskOutput,
  ensureThatFiltersExists('start', 'end'),
  async (ctx) => {
    const requested = Object.keys(mask(
      Object.values(REQUESTABLE).reduce((acc, curr) => Object.assign(acc, { [curr]: null }), {}),
      (ctx.query || {}).mask || ',',
    ));

    const { filters } = ctx.query;

    ctx.body = await statAggregator(
      requested,
      {
        timeUnit: filters['time-unit'] || 'day',
        timeScope: filters['time-scope'] || 'week',
        start: new Date(filters.start),
        end: new Date(filters.end),
        campuses: [ctx.params.campus_id],
      },
    );
  },
);

export default router;
