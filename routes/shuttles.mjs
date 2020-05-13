import generateCRUD from '../helpers/abstract-route';
import Shuttle from '../models/shuttle';
/*
* Rides rights are almost equal to shuttles rights
* */
import {
  CAN_CREATE_RIDE,
  CAN_EDIT_RIDE,
  CAN_GET_RIDE,
  CAN_GET_OWNED_RIDE,
  CAN_GET_RIDE_WITH_TOKEN,
  CAN_EDIT_OWNED_RIDE,
  CAN_DELETE_SHUTTLE, CAN_LIST_SHUTTLE,
} from '../models/rights';
import maskOutput from '../middlewares/mask-output';
import { ensureThatFiltersExists, filtersFromParams } from '../middlewares/query-helper';
import ioEmitMiddleware from '../middlewares/io-emit';
import { prefetchMiddleware } from '../helpers/prefetch-document';

const SHUTTLE_UPDATE_EVENT = 'shuttleUpdate';

const router = generateCRUD(Shuttle, {
  create: {
    right: [CAN_CREATE_RIDE],
    middlewares: [
      maskOutput,
      ioEmitMiddleware(SHUTTLE_UPDATE_EVENT, [
        'shuttle', 'campus',
      ]),
    ],
  },
  list: {
    right: [CAN_LIST_SHUTTLE],
    middlewares: [
      maskOutput,
      filtersFromParams('campus._id', 'campus_id'),
      ensureThatFiltersExists('start', 'end'),
    ],
    async main(ctx) {
      const { offset, limit } = ctx.parseRangePagination(Shuttle, { max: 1000 });
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
    middlewares: [ioEmitMiddleware(SHUTTLE_UPDATE_EVENT, [
      'shuttle', 'campus', 'driver',
    ])],
    async main(ctx) {
      const { body } = ctx.request;
      const { id } = ctx.params;
      const shuttle = ctx.getPrefetchedDocument(id, Shuttle);
      if (!ctx.may(CAN_EDIT_RIDE)) {
        ctx.throw_and_log(400, 'You\'re only authorized to edit a draft');
      }

      delete body.status;

      shuttle.set(body);
      ctx.body = await shuttle.save();
      ctx.log.info(`${Shuttle.modelName} "${id}" has been modified`);
    },
  },
  delete: {
    right: CAN_DELETE_SHUTTLE,
  },
});

export default router;
