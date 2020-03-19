import generateCRUD from '../helpers/abstract-route';
import PhoneModel from '../models/phone-model';
import { csvToJson } from '../middlewares/csv-to-json';

import {
  CAN_CREATE_PHONE_MODEL,
  CAN_EDIT_PHONE_MODEL,
  CAN_GET_PHONE_MODEL,
  CAN_LIST_PHONE_MODEL,
  CAN_REMOVE_PHONE_MODEL,
} from '../models/rights';
import contentNegociation from '../middlewares/content-negociation';
import maskOutput from '../middlewares/mask-output';

const router = generateCRUD(PhoneModel, {
  create: {
    right: CAN_CREATE_PHONE_MODEL,
  },
  list: {
    middlewares: [
      contentNegociation,
      maskOutput,
    ],
    right: CAN_LIST_PHONE_MODEL,
  },
  get: {
    right: CAN_GET_PHONE_MODEL,
  },
  delete: {
    right: CAN_REMOVE_PHONE_MODEL,
  },
  update: {
    right: CAN_EDIT_PHONE_MODEL,
  },
  batch: {
    right: CAN_CREATE_PHONE_MODEL,
    refs: ['_id', 'label'],
    middlewares: [csvToJson],
  },
});

export default router;
