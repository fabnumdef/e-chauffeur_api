import luxon from 'luxon';
import Router from '@koa/router';
import resolveRights from '../middlewares/check-rights';
import maskOutput from '../middlewares/mask-output';
import {
  CAN_GET_POSITION_HISTORY,
} from '../models/rights';
import GeoTracking from '../models/geo-tracking';

const { DateTime } = luxon;
const router = new Router();

router.get(
  '/positions-history',
  resolveRights(CAN_GET_POSITION_HISTORY),
  maskOutput,
  async (ctx) => {
    const { filters: { date: dateFilter, tolerance = 10, campus = null } = {} } = ctx.query;
    let date = DateTime.local();
    if (dateFilter) {
      date = DateTime.fromISO(dateFilter);
    }

    ctx.log(
      ctx.log.INFO,
      'Positions history fetched',
      {
        filters: {
          date: date.toJSDate(),
          tolerance,
          campus,
        },
      },
    );

    ctx.body = await GeoTracking
      .getHistory(date.minus({ seconds: tolerance }).toJSDate(), date.toJSDate(), campus);
  },
);

export default router.routes();
