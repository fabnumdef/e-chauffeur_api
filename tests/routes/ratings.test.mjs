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
import Campus, { createDummyCampus } from '../models/campus';
import Poi, { createDummyPoi } from '../models/poi';

const config = {
  route: '/ratings',
  generateDummyObject: generateDummyRating,
};

describe('Test the rating API endpoint', async () => {
  before(async () => {
    try {
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
      await Ride.create(newRide);
    } catch (err) {
      throw new Error(err);
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
    const pois = await Poi.find();
    const campuses = await Campus.find();

    await Promise.all(rides.map(({ _id }) => Ride.deleteOne({ _id })));
    await Promise.all(pois.map(({ _id }) => Poi.deleteOne({ _id })));
    await Promise.all(campuses.map(({ _id }) => Campus.deleteOne({ _id })));
  });
});
