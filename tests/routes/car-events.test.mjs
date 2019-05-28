import { generateDriverJWTHeader, generateRegulatorJWTHeader, generateSuperAdminJWTHeader } from '../request';
import CarEvent, { generateDummyCarEvent } from '../models/car-event';
import { createDummyCampus } from '../models/campus';
import { createDummyCar } from '../models/car';
import { createDummyCarModel } from '../models/car-model';
import { testCreate } from '../helpers/crud/create';


const config = {
  route: '/car-events',
  async generateDummyObject() {
    const toDropLater = [];

    const campus = await createDummyCampus();
    toDropLater.push(campus);

    const carModel = await createDummyCarModel();
    toDropLater.push(carModel);

    const car = await createDummyCar({ campus, model: carModel });
    toDropLater.push(car);

    const dummyCarEvent = generateDummyCarEvent({ car });
    return [dummyCarEvent, toDropLater];
  },
};

describe('Test the car events API endpoint', () => {
  it(...testCreate(CarEvent, {
    ...config,
    cannotCall: [generateDriverJWTHeader],
    canCall: [generateRegulatorJWTHeader, generateSuperAdminJWTHeader],
  }));
});
