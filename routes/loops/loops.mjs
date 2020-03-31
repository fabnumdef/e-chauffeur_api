import generateCRUD from '../../helpers/abstract-route';
import Loop from '../../models/loop/loop';
/*
* Rides rights are equal to loop rights
* */
import {
  CAN_CREATE_RIDE,
  CAN_EDIT_RIDE,
  CAN_GET_RIDE,
  CAN_LIST_RIDE, CAN_LIST_SELF_RIDE,
  CAN_REQUEST_RIDE,
  CAN_GET_OWNED_RIDE,
  CAN_GET_RIDE_WITH_TOKEN,
  CAN_EDIT_OWNED_RIDE,
  CAN_DELETE_SELF_RIDE,
} from '../../models/rights';
import { DRAFTED } from '../../models/status';

import contentNegociation from '../../middlewares/content-negociation';
import maskOutput from '../../middlewares/mask-output';
import { ensureThatFiltersExists } from '../../middlewares/query-helper';
import { getPrefetchedLoop, prefetchMiddleware } from '../../helpers/prefetch-document';

const router = generateCRUD(Loop, {
  create: {
    right: [CAN_CREATE_RIDE, CAN_REQUEST_RIDE],
  },
  list: {
    right: [CAN_LIST_RIDE, CAN_LIST_SELF_RIDE],
    filters: {
      campus: 'campus._id',
    },
    middlewares: [
      contentNegociation,
      maskOutput,
      ensureThatFiltersExists('start', 'end'),
    ],
    async main(ctx) {
      const { offset, limit } = ctx.parseRangePagination(Loop, { max: 1000 });

      // @todo static methods to code in Loop model
      const total = await Loop.countDocumentsWithin(ctx.filters, ctx.query.filters);
      const data = await Loop.findWithin(ctx.filters, ctx.query.filters).skip(offset).limit(limit);

      ctx.setRangePagination(Loop, {
        total, offset, count: data.length, limit,
      });

      ctx.body = data;
      ctx.log.info(
        { filters: ctx.filters, offset, limit },
        `Find query in ${Loop.modelName}`,
      );
    },
  },
  get: {
    preMiddlewares: [prefetchMiddleware(Loop)],
    right: [CAN_GET_RIDE, CAN_GET_OWNED_RIDE, CAN_GET_RIDE_WITH_TOKEN],
    middlewares: [maskOutput],
  },
  update: {
    preMiddlewares: [prefetchMiddleware(Loop)],
    right: [CAN_EDIT_RIDE, CAN_EDIT_OWNED_RIDE],
    async main(ctx) {
      const { body } = ctx.request;
      const { id } = ctx.params;
      const loop = getPrefetchedLoop(ctx, id);

      if (!ctx.may(CAN_EDIT_RIDE)) {
        if (loop.status !== DRAFTED) {
          ctx.throw_and_log(400, 'You\'re only authorized to edit a draft');
        }
        delete body.id;
      }

      delete body.status;

      loop.set(body);
      await loop.save();

      ctx.body = loop;
      ctx.log.info(`${Loop.modelName} "${id}" has been modified`);

      // @todo handle socket events
    },
  },
  delete: { right: CAN_DELETE_SELF_RIDE },
});

/*
* @todo specific loop routes :
*   - GET position
*   - MUTATE status
* */

export default router;
