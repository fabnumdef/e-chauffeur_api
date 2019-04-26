import generateCRUD from '../helpers/abstract-route';
import Car from '../models/car';
import {
  CAN_CREATE_CAR, CAN_EDIT_CAR, CAN_GET_CAR, CAN_LIST_CAR, CAN_REMOVE_CAR,
} from '../models/rights';

const router = generateCRUD(Car, {
  create: {
    right: CAN_CREATE_CAR,
  },
  list: {
    right: CAN_LIST_CAR,
    filters: {
      campus: 'campus._id',
    },
  },
  get: {
    right: CAN_GET_CAR,
  },
  delete: {
    right: CAN_REMOVE_CAR,
  },
  update: {
    right: CAN_EDIT_CAR,
  },
});

export default router.routes();
