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
  before(async () => {
    try {
      const dummyRide = generateDummyRide({
        start: new Date(),
        end: new Date(),
      });
      await Ride.create(dummyRide);
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
    const rides = await Ride.find();
    await Promise.all(rides.map(({ _id }) => Ride.deleteOne({ _id })));
  });
});
