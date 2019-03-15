import chai from 'chai';
import request, { generateUserJWTHeader } from '../request';
import { cleanObject } from '../../middlewares/mask-output';
import CarEvent, { generateDummyCarEvent } from '../models/car-event';
import { createDummyCampus } from '../models/campus';
import { createDummyCar } from '../models/car';
import { createDummyCarModel } from '../models/car-model';

const { expect } = chai;

describe('Test the car events API endpoint', () => {
  it('POST API endpoint should create a new car-event', async () => {
    const toDropLater = [];

    const campus = await createDummyCampus();
    toDropLater.push(campus);

    const carModel = await createDummyCarModel();
    toDropLater.push(carModel);

    const car = await createDummyCar({ campus, model: carModel });
    toDropLater.push(car);

    const dummyCarEvent = generateDummyCarEvent({ car });
    try {
      {
        const response = await request()
          .post('/car-events')
          .set(...generateUserJWTHeader('canCreateCarEvent'))
          .send(cleanObject(dummyCarEvent));
        expect(response.statusCode).to.equal(200);

        const carEvent = await CarEvent
          .find(dummyCarEvent)
          .lean();
        expect(carEvent).to.not.be.null;
      }
      {
        const { statusCode } = await request()
          .post('/car-events')
          .set(...generateUserJWTHeader('canCreateCarEvent'))
          .send(cleanObject(dummyCarEvent));
        expect(statusCode).to.equal(409);
      }
    } finally {
      await Promise.all(toDropLater.map(entity => entity.remove()));
      await CarEvent.deleteOne({ _id: dummyCarEvent._id });
    }
  });
});
