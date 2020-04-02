import generateCRUD from '../helpers/abstract-route';
import Shuttle from '../models/shuttle';
/*
* Rides rights are equal to shuttle rights
* */
import {
  CAN_CREATE_RIDE,
  CAN_EDIT_RIDE,
  CAN_GET_RIDE,
  CAN_LIST_RIDE, CAN_LIST_SELF_RIDE,
  CAN_GET_OWNED_RIDE,
  CAN_GET_RIDE_WITH_TOKEN,
  CAN_EDIT_OWNED_RIDE,
  CAN_DELETE_SHUTTLE,
} from '../models/rights';
import { DRAFTED } from '../models/status';

import maskOutput from '../middlewares/mask-output';
import { ensureThatFiltersExists } from '../middlewares/query-helper';
import { getPrefetchedDocument, prefetchMiddleware } from '../helpers/prefetch-document';
import { SHUTTLE_MODEL_NAME } from '../models/helpers/constants';

// @todo write tests for these routes

const router = generateCRUD(Shuttle, {
  create: {
    right: [CAN_CREATE_RIDE],
  },
  list: {
    right: [CAN_LIST_RIDE, CAN_LIST_SELF_RIDE],
    filters: {
      campus: 'campus._id',
    },
    middlewares: [
      maskOutput,
      ensureThatFiltersExists('start', 'end'),
    ],
    async main(ctx) {
      const { offset, limit } = ctx.parseRangePagination(Shuttle, { max: 1000 });
      // @todo static methods to code in Shuttle model

      const total = await Shuttle.countDocumentsWithin(ctx.filters, ctx.query.filters);
      const data = await Shuttle.findWithin(ctx.filters, ctx.query.filters).skip(offset).limit(limit);
      ctx.setRangePagination(Shuttle, {
        total, offset, count: data.length, limit,
      });

      ctx.body = data;
      ctx.log.info(
        { filters: ctx.filters, offset, limit },
        `Find query in ${Shuttle.modelName}`,
      );
    },
  },
  get: {
    preMiddlewares: [prefetchMiddleware(Shuttle)],
    right: [CAN_GET_RIDE, CAN_GET_OWNED_RIDE, CAN_GET_RIDE_WITH_TOKEN],
    middlewares: [maskOutput],
  },
  update: {
    preMiddlewares: [prefetchMiddleware(Shuttle)],
    right: [CAN_EDIT_RIDE, CAN_EDIT_OWNED_RIDE],
    async main(ctx) {
      const { body } = ctx.request;
      const { id } = ctx.params;
      const shuttle = getPrefetchedDocument(ctx, id, SHUTTLE_MODEL_NAME);
      if (!ctx.may(CAN_EDIT_RIDE)) {
        if (shuttle.status !== DRAFTED) {
          ctx.throw_and_log(400, 'You\'re only authorized to edit a draft');
        }
        delete body.id;
      }

      delete body.status;

      shuttle.set(body);
      await shuttle.save();

      ctx.body = shuttle;
      ctx.log.info(`${Shuttle.modelName} "${id}" has been modified`);

      // @todo handle socket events
    },
  },
  delete: {
    right: CAN_DELETE_SHUTTLE,
  },
});

/*
* @todo specific shuttle routes :
*   - GET position
*   - MUTATE status
* */

export default router;
