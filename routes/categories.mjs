import generateCRUD from '../helpers/abstract-route';
import Category from '../models/category';
import {
  CAN_CREATE_CATEGORY,
  CAN_EDIT_CATEGORY,
  CAN_GET_CATEGORY,
  CAN_LIST_CATEGORY,
  CAN_REMOVE_CATEGORY,
} from '../models/rights';
import { csvToJson } from '../middlewares/csv-to-json';
import contentNegociation from '../middlewares/content-negociation';
import maskOutput from '../middlewares/mask-output';

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
      contentNegociation,
      maskOutput,
      async (ctx, next) => {
        const searchParams = ctx.filters;
        if (ctx.query && ctx.query.search) {
          searchParams.$text = { $search: ctx.query.search };
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
    refs: ['_id'],
    middlewares: [
      csvToJson,
    ],
  },
});

export default router;
