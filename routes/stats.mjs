import Router from '@koa/router';
import mask from 'json-mask';
import maskOutput from '../middlewares/mask-output';
import { ensureThatFiltersExists, filtersFromParams } from '../middlewares/query-helper';
import resolveRights from '../middlewares/check-rights';
import { CAN_GET_STATS } from '../models/rights';
import statAggregator, { REQUESTABLE } from '../helpers/stats-aggregator';

const router = new Router();

router.get(
  '/',
  resolveRights(CAN_GET_STATS),
  maskOutput,
  filtersFromParams('campus._id', 'campus_id'),
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
        start: new Date(filters.start),
        end: new Date(filters.end),
        timeScope: filters['time-scope'] || 'week',
        timeUnit: filters['time-unit'] || 'day',
        campuses: filters.campuses || [],
      },
    );
  },
);

export default router;
