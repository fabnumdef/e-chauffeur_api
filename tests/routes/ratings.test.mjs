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
    const newRide = generateDummyRide({
      start: new Date(),
      end: new Date(),
      campus: dummyCampus,
      departure: dummyDeparture,
      arrival: dummyArrival,
    });
    const dummyRide = await Ride.create(newRide);
    toDropAfter = [
      dummyCampus,
      dummyDeparture,
      dummyArrival,
      dummyRide,
    ];
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
    await Promise.all(toDropAfter.map((entity) => entity.remove()));
  });
});
