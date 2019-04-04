import generateCRUD from '../helpers/abstract-route';
import Poi from '../models/poi';
import {
  CAN_CREATE_POI, CAN_EDIT_POI, CAN_GET_POI, CAN_LIST_POI, CAN_REMOVE_POI,
} from '../models/rights';

const router = generateCRUD(Poi, {
  create: {
    right: CAN_CREATE_POI,
  },
  get: {
    right: CAN_GET_POI,
  },
  delete: {
    right: CAN_REMOVE_POI,
  },
  update: {
    right: CAN_EDIT_POI,
  },
  list: {
    right: CAN_LIST_POI,
    filters: {
      campus: 'campus._id',
    },
    middlewares: [
      async (ctx, next) => {
        const searchParams = {};
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
        ctx.filters = searchParams;
        await next();
      },
    ],
  },
});

export default router.routes();
