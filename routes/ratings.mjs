import generateCRUD from '../helpers/abstract-route';
import Rating from '../models/rating';
import {
  CAN_CREATE_RATING,
  CAN_GET_RATING,
} from '../models/rights';

const router = generateCRUD(Rating, {
  create: {
    right: [CAN_CREATE_RATING],
  },
  list: {
    right: [CAN_GET_RATING],
  },
});

export default router.routes();
