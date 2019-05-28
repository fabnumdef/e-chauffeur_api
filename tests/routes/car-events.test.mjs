import {
  generateDriverJWTHeader,
  generateRegulatorJWTHeader,
  generateSuperAdminJWTHeader,
} from '../request';
import CarEvent, { generateDummyCarEvent } from '../models/car-event';
import { createDummyCampus } from '../models/campus';
import { createDummyCar } from '../models/car';
import { createDummyCarModel } from '../models/car-model';
import {
  testCreate, testDelete, testList, testGet, testUpdate,
} from '../helpers/crud';

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
  cannotCall: [generateDriverJWTHeader],
  canCall: [generateRegulatorJWTHeader, generateSuperAdminJWTHeader],
};

describe('Test the car events API endpoint', () => {
  it(...testCreate(CarEvent, {
    ...config,
  }));

  it(...testList(CarEvent, {
    ...config,
  }));

  it(...testDelete(CarEvent, {
    ...config,
    route: ({ id }) => `${config.route}/${id}`,
  }));

  it(...testGet(CarEvent, {
    ...config,
    route: ({ id }) => `${config.route}/${id}`,
  }));

  it(...testUpdate(CarEvent, {
    ...config,
    route: ({ id }) => `${config.route}/${id}`,
  }));
});
