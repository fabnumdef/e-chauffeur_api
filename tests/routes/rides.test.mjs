import chai from 'chai';
import Luxon from 'luxon';
import request, { generateRegulatorJWTHeader } from '../request';
import { createDummyCampus } from '../models/campus';
import Ride, { generateDummyRide } from '../models/ride';
import { createDummyPoi } from '../models/poi';

const { DateTime, Duration } = Luxon;
const date = DateTime.local();
const oneDay = Duration.fromObject({ days: 1 });
const { expect } = chai;
let dummyCampus;
let toDropAfter = [];

describe('Test the rides route', () => {
  before(async () => {
    dummyCampus = await createDummyCampus();
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
    await Promise.all(toDropAfter.map((entity) => entity.remove()));
  });
});
