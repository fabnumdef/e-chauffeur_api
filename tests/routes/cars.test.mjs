import chai from 'chai';
import request, { generateUserJWTHeader } from '../request';
import { cleanObject } from '../../middlewares/mask-output';
import { createDummyCampus } from '../models/campus';
import { createDummyCarModel } from '../models/car-model';
import Car, { generateDummyCar } from '../models/car';

const { expect } = chai;

describe('Test the car API endpoint', () => {
  it('POST API endpoint should create a new car', async () => {
    const toDropLater = [];

    const campus = await createDummyCampus();
    toDropLater.push(campus);

    const carModel = await createDummyCarModel();
    toDropLater.push(carModel);

    const dummyCar = generateDummyCar({ campus, model: carModel });
    try {
      {
        const response = await request()
          .post('/cars')
          .set(...generateUserJWTHeader('canCreateCar'))
          .send(cleanObject(dummyCar));
        expect(response.statusCode).to.equal(200);

        const car = await Car
          .find(dummyCar)
          .lean();
        expect(car).to.not.be.null;
      }
      {
        const { statusCode } = await request()
          .post('/cars')
          .set(...generateUserJWTHeader('canCreateCar'))
          .send(cleanObject(dummyCar));
        expect(statusCode).to.equal(409);
      }
    } finally {
      await Promise.all(toDropLater.map(entity => entity.remove()));
      await Car.deleteOne({ _id: dummyCar._id });
    }
  });
});
