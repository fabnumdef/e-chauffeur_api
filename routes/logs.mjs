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

export default router.routes();
