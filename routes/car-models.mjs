import generateCRUD from '../helpers/abstract-route';
import CarModel from '../models/car-model';
import {
  CAN_CREATE_CAR_MODEL,
  CAN_EDIT_CAR_MODEL,
  CAN_GET_CAR_MODEL,
  CAN_LIST_CAR_MODEL,
  CAN_REMOVE_CAR_MODEL,
} from '../models/rights';
import contentNegociation from '../middlewares/content-negociation';
import maskOutput from '../middlewares/mask-output';
import { csvToJson } from '../middlewares/csv-to-json';
import searchQuery from '../middlewares/search-query';

const router = generateCRUD(CarModel, {
  create: {
    right: CAN_CREATE_CAR_MODEL,
  },
  list: {
    middlewares: [
      contentNegociation,
      maskOutput,
      searchQuery,
    ],
    right: CAN_LIST_CAR_MODEL,
  },
  get: {
    right: CAN_GET_CAR_MODEL,
  },
  delete: {
    right: CAN_REMOVE_CAR_MODEL,
  },
  update: {
    right: CAN_EDIT_CAR_MODEL,
  },
  batch: {
    right: CAN_CREATE_CAR_MODEL,
    refs: ['_id', 'label'],
    middlewares: [csvToJson],
  },
});

export default router;
