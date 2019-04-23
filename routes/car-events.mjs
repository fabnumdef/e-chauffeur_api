import generateCRUD from '../helpers/abstract-route';
import CarEvent from '../models/car-event';
import {
  CAN_CREATE_CAR_EVENT,
  CAN_EDIT_CAR_EVENT,
  CAN_GET_CAR_EVENT,
  CAN_LIST_CAR_EVENT,
  CAN_REMOVE_CAR_EVENT,
} from '../models/rights';

const router = generateCRUD(CarEvent, {
  create: {
    right: CAN_CREATE_CAR_EVENT,
  },
  list: {
    right: CAN_LIST_CAR_EVENT,
    filters: {
      car: 'car._id',
    },
  },
  get: {
    right: CAN_GET_CAR_EVENT,
  },
  delete: {
    right: CAN_REMOVE_CAR_EVENT,
  },
  update: {
    right: CAN_EDIT_CAR_EVENT,
  },
});

export default router.routes();
