import generateCRUD from '../helpers/abstract-route';
import UserEvent from '../models/user-event';
import {
  CAN_CREATE_USER_EVENT,
  CAN_EDIT_USER_EVENT,
  CAN_GET_USER_EVENT,
  CAN_LIST_USER_EVENT,
  CAN_REMOVE_USER_EVENT,
} from '../models/rights';

const router = generateCRUD(UserEvent, {
  create: {
    right: CAN_CREATE_USER_EVENT,
  },
  list: {
    right: CAN_LIST_USER_EVENT,
    filters: {
      user: 'user._id',
    },
  },
  get: {
    right: CAN_GET_USER_EVENT,
  },
  delete: {
    right: CAN_REMOVE_USER_EVENT,
  },
  update: {
    right: CAN_EDIT_USER_EVENT,
  },
});

export default router.routes();
