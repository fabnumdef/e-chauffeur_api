import generateCRUD from '../helpers/abstract-route';
import Car from '../models/car';
import {
  CAN_CREATE_CAR, CAN_EDIT_CAR, CAN_GET_CAR, CAN_LIST_CAR, CAN_REMOVE_CAR,
} from '../models/rights';
import { csvToJson, validateCampus } from '../middlewares/csv-to-json';
import contentNegociation from '../middlewares/content-negociation';
import maskOutput from '../middlewares/mask-output';
import searchQuery from '../middlewares/search-query';
import { filtersFromParams } from '../middlewares/query-helper';

const router = generateCRUD(Car, {
  create: {
    right: CAN_CREATE_CAR,
  },
  list: {
    right: CAN_LIST_CAR,
    middlewares: [
      contentNegociation,
      maskOutput,
      searchQuery,
      filtersFromParams('campus._id', 'campus_id'),
    ],
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
  batch: {
    right: CAN_CREATE_CAR,
    refs: ['_id', 'label'],
    middlewares: [
      csvToJson,
      validateCampus,
    ],
  },
});

export default router;
