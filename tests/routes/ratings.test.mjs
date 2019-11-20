import Luxon from 'luxon';
import {
  testCreate, testList,
} from '../helpers/crud';
import Rating, { generateDummyRating } from '../models/rating';
import {
  generateSuperAdminJWTHeader,
  generateAdminJWTHeader,
  generateAnonymousJWTHeader,
} from '../request';
import { createDummyCampus } from '../models/campus';
import { createDummyCarModel } from '../models/car-model';
import { createDummyCar } from '../models/car';
import Ride, { generateDummyRide } from '../models/ride';
import { generateDummyUser } from '../models/user';
import { createDummyPoi } from '../models/poi';
import { generateDummyCategory } from '../models/category';

const { DateTime, Duration } = Luxon;
const tenMinutes = Duration.fromObject({ minutes: 10 });
const config = {
  route: '/ratings',
  generateDummyObject: generateDummyRating,
};

describe('Test the rating API endpoint', async () => {
  const toDropLater = [];
  before(async () => {
    try {
      const dummyCampus = await createDummyCampus();
      toDropLater.push(dummyCampus);


      const dummyCarModel = await createDummyCarModel();
      toDropLater.push(dummyCarModel);

      const dummyCar = await createDummyCar({
        model: dummyCarModel,
        campus: dummyCampus,
      });
      toDropLater.push(dummyCar);

      const dummyDeparture = await createDummyPoi();
      const dummyArrival = await createDummyPoi();
      toDropLater.push(dummyDeparture);
      toDropLater.push(dummyArrival);

      const dummyDriver = generateDummyUser();
      const dummyCategory = generateDummyCategory();
      const date = DateTime.local();
      const dummyRide = generateDummyRide({
        campus: dummyCampus,
        car: dummyCar,
        driver: dummyDriver,
        departure: dummyDeparture,
        arrival: dummyArrival,
        category: dummyCategory,
        start: date.minus(tenMinutes)
          .toJSDate(),
        end: date.plus(tenMinutes)
          .toJSDate(),
      });
      const rideModel = new Ride(dummyRide);
      const savedRide = await rideModel.save();
      toDropLater.push(savedRide);
    } catch (e) {
      throw new Error('Ride creation failed');
    }
  });

  it(...testCreate(Rating, {
    ...config,
    canCall: [generateAnonymousJWTHeader],
  }));
  it(...testList(Rating, {
    ...config,
    cannotCall: [generateAdminJWTHeader],
    canCall: [generateSuperAdminJWTHeader],
  }));

  after(async () => {
    await Promise.all(toDropLater.map((entity) => entity.remove()));
  });
});
