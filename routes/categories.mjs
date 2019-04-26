import generateCRUD from '../helpers/abstract-route';
import Category from '../models/category';
import {
  CAN_CREATE_CATEGORY,
  CAN_EDIT_CATEGORY,
  CAN_GET_CATEGORY,
  CAN_LIST_CATEGORY,
  CAN_REMOVE_CATEGORY,
} from '../models/rights';

const router = generateCRUD(Category, {
  create: {
    right: CAN_CREATE_CATEGORY,
  },
  list: {
    right: CAN_LIST_CATEGORY,
    filters: {
      campus: 'campus._id',
    },
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
});

export default router.routes();
