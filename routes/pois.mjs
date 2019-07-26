import generateCRUD from '../helpers/abstract-route';
import Poi from '../models/poi';
import {
  CAN_CREATE_POI,
  CAN_CREATE_POI_LOCAL,
  CAN_EDIT_POI,
  CAN_EDIT_POI_LOCAL,
  CAN_GET_POI,
  CAN_GET_POI_LOCAL,
  CAN_LIST_POI,
  CAN_LIST_POI_LOCAL,
  CAN_REMOVE_POI,
  CAN_REMOVE_POI_LOCAL,
} from '../models/rights';

const router = generateCRUD(Poi, {
  create: {
    right: [CAN_CREATE_POI, CAN_CREATE_POI_LOCAL],
  },
  get: {
    right: [CAN_GET_POI, CAN_GET_POI_LOCAL],
  },
  delete: {
    right: [CAN_REMOVE_POI, CAN_REMOVE_POI_LOCAL],
  },
  update: {
    right: [CAN_EDIT_POI, CAN_EDIT_POI_LOCAL],
  },
  list: {
    right: [CAN_LIST_POI, CAN_LIST_POI_LOCAL],
    filters: {
      campus: 'campus._id',
    },
    middlewares: [
      async (ctx, next) => {
        const searchParams = ctx.filters;
        if (ctx.query && ctx.query.search) {
          searchParams.$or = [
            {
              _id: new RegExp(ctx.query.search, 'i'),
            },
            {
              label: new RegExp(ctx.query.search, 'i'),
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
