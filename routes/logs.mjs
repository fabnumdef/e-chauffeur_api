import generateCRUD from '../helpers/abstract-route';
import logger from '../services/logger';
import {
  CAN_LIST_LOG,
} from '../models/rights';

const fakeModel = { modelName: 'log' };
const router = generateCRUD(fakeModel, {
  list: {
    right: CAN_LIST_LOG,
    async main(ctx) {
      const { offset, limit } = ctx.parseRangePagination(fakeModel);

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

      ctx.log(
        ctx.log.INFO,
        `Find query in ${fakeModel.modelName}`,
        {
          filters: ctx.filters, offset, limit,
        },
      );

      ctx.setRangePagination(fakeModel, {
        offset,
        limit,
      });

      ctx.body = data;
    },
  },
});

export default router.routes();
