import Router from '@koa/router';
import mask from 'json-mask';
import maskOutput from '../../middlewares/mask-output';
import Campus from '../../models/campus';
import { ensureThatFiltersExists } from '../../middlewares/query-helper';
import resolveRights from '../../middlewares/check-rights';
import { CAN_GET_CAMPUS_STATS } from '../../models/rights';

const router = new Router();

const REQUESTABLE = {
  total: 'total',
  poisArrival: 'pois-arrival',
  poisDeparture: 'pois-departure',
  categories: 'categories',
  carModels: 'car-models',
  statuses: 'statuses',
  drivers: 'drivers',
  hasPhone: 'has-phone',
  period: 'period',
  uxGrade: 'uxGrade',
  recommendationGrade: 'recommendationGrade',
};

router.get(
  '/',
  resolveRights(CAN_GET_CAMPUS_STATS),
  maskOutput,
  ensureThatFiltersExists('start', 'end'),
  async (ctx) => {
    const start = new Date(ctx.query.filters.start);
    const end = new Date(ctx.query.filters.end);
    const timeScope = ctx.query.filters['time-scope'] || 'week';
    const timeUnit = ctx.query.filters['time-unit'] || 'day';

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
        case REQUESTABLE.poisArrival:
          v = await Campus.aggregateRidesByArrivalPOI(ctx.params.campus_id, start, end);
          break;
        case REQUESTABLE.poisDeparture:
          v = await Campus.aggregateRidesByDeparturePOI(ctx.params.campus_id, start, end);
          break;
        case REQUESTABLE.categories:
          v = await Campus.aggregateRidesByCategory(ctx.params.campus_id, start, end);
          break;
        case REQUESTABLE.drivers:
          v = await Campus.aggregateRidesByDriver(ctx.params.campus_id, start, end);
          break;
        case REQUESTABLE.carModels:
          v = await Campus.aggregateRidesByCarModel(ctx.params.campus_id, start, end);
          break;
        case REQUESTABLE.statuses:
          v = await Campus.aggregateRidesByStatus(ctx.params.campus_id, start, end);
          break;
        case REQUESTABLE.hasPhone:
          {
            const result = await Campus.aggregateRidesByPhonePresence(ctx.params.campus_id, start, end);
            v = {
              true: (result.find(({ _id }) => _id === true) || {}).total || 0,
              false: (result.find(({ _id }) => _id === false) || {}).total || 0,
            };
          }
          break;
        case REQUESTABLE.period:
          {
            const results = await Campus.aggregateRidesOverTime(
              ctx.params.campus_id,
              start,
              end,
              { timeUnit, timeScope },
            );
            if (timeUnit === 'day') {
              v = Array.from({ length: 7 }).map((_, index) => {
                const _id = index + 1;
                return results.find((row) => row._id === _id) || { _id };
              });
            } else if (timeUnit === 'month') {
              v = Array.from({ length: 12 }).map((_, index) => {
                const _id = index + 1;
                return results.find((row) => row._id === _id) || { _id };
              });
            } else if (timeUnit === 'hour') {
              v = Array.from({ length: 24 }).map((_, index) => {
                const _id = index;
                return results.find((row) => row._id === _id) || { _id };
              });
            } else {
              v = results;
            }
          }
          break;
        case REQUESTABLE.uxGrade:
          v = await Campus.aggregateRatingsByUXGrade(ctx.params.campus_id, start, end);
          break;
        case REQUESTABLE.recommendationGrade:
          v = await Campus.aggregateRatingsByRecommendationGrade(ctx.params.campus_id, start, end);
          break;
        default:
      }

      return { [r]: v };
    }))).reduce((acc, curr) => Object.assign(acc, curr), {});
  },
);

export default router;
