import generateCRUD from '../../helpers/abstract-route';
import LoopPattern from '../../models/loop/pattern';
import {
  CAN_CREATE_LOOP_PATTERN,
  CAN_LIST_LOOP_PATTERN,
  CAN_GET_LOOP_PATTERN,
  CAN_UPDATE_LOOP_PATTERN,
  CAN_DELETE_LOOP_PATTERN,
} from '../../models/rights';
import maskOutput from '../../middlewares/mask-output';
import contentNegociation from '../../middlewares/content-negociation';

const router = generateCRUD(LoopPattern, {
  create: { right: CAN_CREATE_LOOP_PATTERN },
  list: {
    right: CAN_LIST_LOOP_PATTERN,
    filters: { campus: 'campus._id' },
    middlewares: [
      contentNegociation,
      maskOutput,
    ],
  },
  get: {
    right: CAN_GET_LOOP_PATTERN,
    middlewares: [
      maskOutput,
    ],
  },
  update: {
    right: CAN_UPDATE_LOOP_PATTERN,
    middlewares: [
      maskOutput,
    ],
  },
  delete: { right: CAN_DELETE_LOOP_PATTERN },
});

export default router;
