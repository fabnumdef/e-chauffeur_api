import generateCRUD from '../helpers/abstract-route';
import Category from '../models/category';
import {
  CAN_CREATE_CATEGORY,
  CAN_EDIT_CATEGORY,
  CAN_GET_CATEGORY,
  CAN_LIST_CATEGORY,
  CAN_REMOVE_CATEGORY,
} from '../models/rights';
import { csvToJson, checkDuplications } from '../middlewares/csv-to-json';

const router = generateCRUD(Category, {
  create: {
    right: CAN_CREATE_CATEGORY,
  },
  list: {
    right: CAN_LIST_CATEGORY,
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
  get: {
    right: CAN_GET_CATEGORY,
  },
  delete: {
    right: CAN_REMOVE_CATEGORY,
  },
  update: {
    right: CAN_EDIT_CATEGORY,
  },
  batch: {
    right: CAN_CREATE_CATEGORY,
    middlewares: [
      csvToJson,
      checkDuplications(Category, 'label'),
    ],
  },
});

export default router.routes();
