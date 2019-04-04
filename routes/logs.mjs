import Router from 'koa-router';
import maskOutput from '../middlewares/mask-output';

import Poi from '../models/poi';
import checkRights from '../middlewares/check-rights';
import {
  CAN_LIST_LOG,
} from '../models/rights';
import logger from '../services/logger';

const router = new Router();

router.get(
  '/',
  checkRights(CAN_LIST_LOG),
  maskOutput,
  async (ctx) => {
    const searchParams = { ...ctx.filters };
    if (ctx.query && ctx.query.search) {
      searchParams.$or = [
        {
          _id: new RegExp(ctx.query.search, 'i'),
        },
        {
          name: new RegExp(ctx.query.search, 'i'),
        },
      ];
    }
    const { offset, limit } = ctx.parseRangePagination(Poi);

    const { mongodb: data } = await new Promise(
      (resolve, reject) => logger.query(
        {
          limit,
          start: offset,
          order: 'desc',
        },
        (err, r) => (err ? reject(err) : resolve(r)),
      ),
    );

    ctx.setRangePagination(Poi, {
      offset,
      limit,
    });

    ctx.body = data;
  },
);

export default router.routes();
