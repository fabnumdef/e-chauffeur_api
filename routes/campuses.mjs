import generateCRUD from '../helpers/abstract-route';
import Campus from '../models/campus';
import driversRoutes from './campuses/drivers';
import driversPositionsRoutes from './campuses/drivers-positions';
import carsRoutes from './campuses/cars';
import statsRoutes from './campuses/stats';
import {
  CAN_CREATE_CAMPUS,
  CAN_EDIT_CAMPUS,
  CAN_GET_CAMPUS,
  CAN_LIST_CAMPUS,
  CAN_REMOVE_CAMPUS,
} from '../models/rights';

const router = generateCRUD(Campus, {
  create: {
    right: CAN_CREATE_CAMPUS,
  },
  list: {
    right: CAN_LIST_CAMPUS,
    middlewares: [
      async (ctx, next) => {
        const searchParams = {};
        if (ctx.query && ctx.query.search) {
          searchParams.$text = { $search: ctx.query.search };
        }
        ctx.filters = searchParams;
        await next();
      },
    ],
  },
  get: {
    right: CAN_GET_CAMPUS,
  },
  delete: {
    right: CAN_REMOVE_CAMPUS,
  },
  update: {
    right: CAN_EDIT_CAMPUS,
  },
});

router.use('/:campus_id/drivers', driversRoutes);
router.use('/:campus_id/drivers-positions', driversPositionsRoutes);
router.use('/:campus_id/cars', carsRoutes);
router.use('/:campus_id/stats', statsRoutes);

export default router.routes();
