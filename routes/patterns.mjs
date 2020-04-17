import generateCRUD from '../helpers/abstract-route';
import Pattern from '../models/pattern';
import {
  CAN_CREATE_PATTERN,
  CAN_LIST_PATTERN,
  CAN_GET_PATTERN,
  CAN_UPDATE_PATTERN,
  CAN_DELETE_PATTERN,
} from '../models/rights';
import maskOutput from '../middlewares/mask-output';

// @todo write tests for these routes
const router = generateCRUD(Pattern, {
  create: { right: CAN_CREATE_PATTERN },
  list: {
    right: CAN_LIST_PATTERN,
    filters: { campus: 'campus._id' },
    middlewares: [maskOutput],
  },
  get: {
    right: CAN_GET_PATTERN,
    middlewares: [maskOutput],
  },
  update: {
    right: CAN_UPDATE_PATTERN,
    middlewares: [maskOutput],
  },
  delete: { right: CAN_DELETE_PATTERN },
});

export default router;
