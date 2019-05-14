import Router from 'koa-router';
import maskOutput from '../../middlewares/mask-output';
import resolveRights from '../../middlewares/check-rights';
import Campus from '../../models/campus';
import Ride from '../../models/ride';
import { ensureThatFiltersExists } from '../../middlewares/query-helper';
import { CAN_LIST_CAMPUS_CAR } from '../../models/rights';

const router = new Router();

router.get(
  '/',
  resolveRights(CAN_LIST_CAMPUS_CAR),
  maskOutput,
  ensureThatFiltersExists('start', 'end'),
  async (ctx) => {
    const start = new Date(ctx.query.filters.start);
    const end = new Date(ctx.query.filters.end);
    let lastRidedCar = null;
    // @todo: Refactor this to sort the whole array of cars, by usage
    if (ctx.query.sort && ctx.query.sort['last-driver-ride']) {
      const rides = await Ride.find({ 'driver._id': ctx.query.sort['last-driver-ride'] })
        .sort({ $natural: -1 }).limit(1);
      lastRidedCar = rides[0] && rides[0].car ? rides[0].car : null;
    }
    let sortedCars = [];
    const cars = await Campus.findCars(ctx.params.campus_id, start, end);
    if (lastRidedCar) {
      sortedCars.push(lastRidedCar);
      cars.forEach(car => car._id !== lastRidedCar._id && sortedCars.push(car));
    } else {
      sortedCars = cars;
    }
    ctx.body = sortedCars;
  },
);

export default router.routes();
