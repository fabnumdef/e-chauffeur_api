import mask from 'json-mask';
import generateCRUD from '../helpers/abstract-route';
import Campus from '../models/campus';
import usersRoutes from './campuses/users';
import driversRoutes from './campuses/drivers';
import driversPositionsRoutes from './campuses/drivers-positions';
import carsRoutes from './campuses/cars';
import statsRoutes from './campuses/stats';
import {
  CAN_CREATE_CAMPUS,
  CAN_EDIT_CAMPUS, CAN_EDIT_SELF_CAMPUS,
  CAN_GET_CAMPUS, CAN_GET_CAMPUS_BASIC,
  CAN_LIST_CAMPUS, CAN_LIST_CAMPUS_BASIC,
  CAN_REMOVE_CAMPUS,
} from '../models/rights';
import contentNegociation from '../middlewares/content-negociation';
import maskOutput from '../middlewares/mask-output';
import searchQuery from '../middlewares/search-query';
import { emitDriverConnection } from '../middlewares/drivers-socket-status';

const BASIC_OUTPUT_MASK = '_id,id,name,location(coordinates),phone(everybody),defaultReservationScope';
const router = generateCRUD(Campus, {
  create: {
    right: CAN_CREATE_CAMPUS,
  },
  list: {
    right: [CAN_LIST_CAMPUS_BASIC, CAN_LIST_CAMPUS],
    middlewares: [
      contentNegociation,
      maskOutput,
      searchQuery,
      async (ctx, next) => {
        await next();
        if (!ctx.may(CAN_LIST_CAMPUS)) {
          ctx.body = mask(ctx.body, BASIC_OUTPUT_MASK);
        }
      },
    ],
  },
  get: {
    lean: false,
    right: [CAN_GET_CAMPUS_BASIC, CAN_GET_CAMPUS],
    middlewares: [
      emitDriverConnection,
      async (ctx, next) => {
        await next();
        if (!ctx.may(CAN_GET_CAMPUS)) {
          ctx.body = mask(ctx.body, BASIC_OUTPUT_MASK);
        }
      },
    ],
  },
  delete: {
    right: CAN_REMOVE_CAMPUS,
  },
  update: {
    paramId: 'campus_id',
    right: [CAN_EDIT_CAMPUS, CAN_EDIT_SELF_CAMPUS],
  },
});

router.use('/:campus_id/users', usersRoutes.routes());
router.use('/:campus_id/users', usersRoutes.allowedMethods());
router.use('/:campus_id/drivers', driversRoutes.routes());
router.use('/:campus_id/drivers', driversRoutes.allowedMethods());
router.use('/:campus_id/drivers-positions', driversPositionsRoutes.routes());
router.use('/:campus_id/drivers-positions', driversPositionsRoutes.allowedMethods());
router.use('/:campus_id/cars', carsRoutes.routes());
router.use('/:campus_id/cars', carsRoutes.allowedMethods());
router.use('/:campus_id/stats', statsRoutes.routes());
router.use('/:campus_id/stats', statsRoutes.allowedMethods());

export default router;
