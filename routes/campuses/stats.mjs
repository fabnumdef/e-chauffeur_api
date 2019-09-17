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
  poisArrival: 'pois-arrival',
  poisDeparture: 'pois-departure',
  categories: 'categories',
  carModels: 'car-models',
  statuses: 'statuses',
  drivers: 'drivers',
  hasPhone: 'has-phone',
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
        default:
      }
      return { [r]: v };
    }))).reduce((acc, curr) => Object.assign(acc, curr), {});
  },
);

export default router.routes();
