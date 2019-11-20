import chai from 'chai';
import Luxon from 'luxon';
import request, { generateRegulatorJWTHeader } from '../request';
import Campus, { createDummyCampus } from '../models/campus';
import Ride, { generateDummyRide } from '../models/ride';
import Poi, { createDummyPoi } from '../models/poi';

const { DateTime, Duration } = Luxon;
const tenMinutes = Duration.fromObject({ minutes: 10 });
const date = DateTime.local();
const oneDay = Duration.fromObject({ days: 1 });
const { expect } = chai;
let dummyCampus;

describe('Test the rides route', () => {
  before(async () => {
    try {
      dummyCampus = await createDummyCampus();
      const dummyDeparture = await createDummyPoi();
      const dummyArrival = await createDummyPoi();
      const dummyRide = generateDummyRide({
        campus: dummyCampus,
        departure: dummyDeparture,
        arrival: dummyArrival,
        start: date.minus(tenMinutes)
          .toJSDate(),
        end: date.plus(tenMinutes)
          .toJSDate(),
      });
      const rideModel = new Ride(dummyRide);
      await rideModel.save();
    } catch (err) {
      throw new Error(err);
    }
  });

  it('It should response the GET method', async () => {
    const query = {
      mask: 'id',
      filters: {
        campus: dummyCampus._id,
        start: date.minus(oneDay).toJSDate(),
        end: date.plus(oneDay).toJSDate(),
      },
    };
    {
      const response = await request()
        .get('/rides')
        .set('Accept', 'text/csv')
        .set(...generateRegulatorJWTHeader())
        .query(query);
      expect(response.statusCode).to.equal(200);
      expect(response.headers['content-type']).to.contain('text/csv');
    }
    {
      const response = await request()
        .get('/rides')
        .set(...generateRegulatorJWTHeader())
        .query(query);
      expect(response.statusCode).to.equal(200);
      expect(response.headers['content-type']).to.contain('application/json');
    }
  });

  after(async () => {
    const rides = await Ride.find();
    const pois = await Poi.find();
    const campuses = await Campus.find();

    await Promise.all(rides.map(({ _id }) => Ride.deleteOne({ _id })));
    await Promise.all(pois.map(({ _id }) => Poi.deleteOne({ _id })));
    await Promise.all(campuses.map(({ _id }) => Campus.deleteOne({ _id })));
  });
});
