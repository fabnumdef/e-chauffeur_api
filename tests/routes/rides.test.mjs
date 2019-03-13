import chai from 'chai';
import Luxon from 'luxon';
import request from '../request';
import { createDummyCampus } from '../models/campus';
import { createDummyCarModel } from '../models/car-model';
import { createDummyCar } from '../models/car';
import Ride, { generateDummyRide } from '../models/ride';
import { generateDummyUser } from '../models/user';
import { createDummyPoi } from '../models/poi';
import { generateDummyCategory } from '../models/category';

const { DateTime, Duration } = Luxon;
const tenMinutes = Duration.fromObject({ minutes: 10 });
const oneDay = Duration.fromObject({ days: 1 });
const { expect } = chai;

describe('Test the rides route', () => {
  it('It should response the GET method', async () => {
    const toDropLater = [];

    try {
      const dummyCampus = await createDummyCampus();
      toDropLater.push(dummyCampus);


      const dummyCarModel = await createDummyCarModel(dummyCampus);
      toDropLater.push(dummyCarModel);

      const dummyCar = await createDummyCar({ model: dummyCarModel, campus: dummyCampus });
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
        start: date.minus(tenMinutes).toJSDate(),
        end: date.plus(tenMinutes).toJSDate(),
      });
      const rideModel = new Ride(dummyRide);
      await rideModel.save();

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
          .query(query);
        expect(response.statusCode).to.equal(200);
        expect(response.headers['content-type']).to.contain('text/csv');
      }
      {
        const response = await request()
          .get('/rides')
          .query(query);
        expect(response.statusCode).to.equal(200);
        expect(response.headers['content-type']).to.contain('application/json');
      }
    } finally {
      await Promise.all(toDropLater.map(entity => entity.remove()));
    }
  });
});
