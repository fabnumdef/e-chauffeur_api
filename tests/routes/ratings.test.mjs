import {
  testCreate, testList,
} from '../helpers/crud';
import Rating, { generateDummyRating } from '../models/rating';
import {
  generateSuperAdminJWTHeader,
  generateAdminJWTHeader,
  generateAnonymousJWTHeader,
} from '../request';
import Ride, { generateDummyRide } from '../models/ride';
import { createDummyCampus } from '../models/campus';
import { createDummyPoi } from '../models/poi';
import { createDummyCarModel } from '../models/car-model';
import { createDummyCar } from '../models/car';

const config = {
  route: '/ratings',
  generateDummyObject: generateDummyRating,
};
let toDropAfter = [];

describe('Test the rating API endpoint', async () => {
  before(async () => {
    const dummyCampus = await createDummyCampus();
    const dummyDeparture = await createDummyPoi();
    const dummyArrival = await createDummyPoi();
    const dummyCarModel = await createDummyCarModel();
    const dummyCar = await createDummyCar({ model: dummyCarModel, campus: dummyCampus });

    const newRide = generateDummyRide({
      start: new Date(),
      end: new Date(Date.now() + 1000),
      campus: dummyCampus,
      departure: dummyDeparture,
      arrival: dummyArrival,
      car: dummyCar,
    });
    const dummyRide = await Ride.create(newRide);
    toDropAfter = [
      dummyCampus,
      dummyDeparture,
      dummyArrival,
      dummyRide,
      dummyCar,
      dummyCarModel,
    ];
  });

  it(...testCreate(Rating, {
    ...config,
    canCall: [generateAnonymousJWTHeader],
    expectedStatus: 204,
  }));
  it(...testList(Rating, {
    ...config,
    cannotCall: [generateAdminJWTHeader],
    canCall: [generateSuperAdminJWTHeader],
  }));

  after(async () => {
    await Promise.all(toDropAfter.map((entity) => entity.deleteOne()));
  });
});
