import generateCRUD from '../helpers/abstract-route';
import ShuttleFactory from '../models/shuttle-factory';
import {
  CAN_CREATE_SHUTTLE_FACTORIES,
  CAN_LIST_SHUTTLE_FACTORIES,
  CAN_GET_SHUTTLE_FACTORIES,
  CAN_UPDATE_SHUTTLE_FACTORIES,
  CAN_DELETE_SHUTTLE_FACTORIES,
} from '../models/rights';
import maskOutput from '../middlewares/mask-output';

const router = generateCRUD(ShuttleFactory, {
  create: { right: CAN_CREATE_SHUTTLE_FACTORIES },
  list: {
    right: CAN_LIST_SHUTTLE_FACTORIES,
    filters: { campus: 'campus._id' },
    middlewares: [maskOutput],
  },
  get: {
    right: CAN_GET_SHUTTLE_FACTORIES,
    middlewares: [maskOutput],
  },
  update: {
    right: CAN_UPDATE_SHUTTLE_FACTORIES,
    middlewares: [maskOutput],
  },
  delete: { right: CAN_DELETE_SHUTTLE_FACTORIES },
});

export default router;
