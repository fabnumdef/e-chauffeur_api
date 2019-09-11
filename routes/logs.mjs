import luxon from 'luxon';
import generateCRUD from '../helpers/abstract-route';
import resolveRights from '../middlewares/check-rights';
import maskOutput from '../middlewares/mask-output';
import logger from '../services/logger';
import {
  CAN_GET_POSITION_HISTORY,
  CAN_LIST_LOG,
} from '../models/rights';
import GeoTracking from '../models/geo-tracking';

const { DateTime } = luxon;
const fakeModel = { modelName: 'log' };
const router = generateCRUD(fakeModel, {
  list: {
    right: CAN_LIST_LOG,
    async main(ctx) {
      const limit = 100;

      const { mongodb: data } = await new Promise(
        (resolve, reject) => logger.query(
          {
            limit,
            order: 'desc',
          },
          (err, r) => (err ? reject(err) : resolve(r)),
        ),
      );

      ctx.log(
        ctx.log.INFO,
        `Find query in ${fakeModel.modelName}`,
        {
          filters: ctx.filters, limit,
        },
      );

      ctx.body = data;
    },
  },
});

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
