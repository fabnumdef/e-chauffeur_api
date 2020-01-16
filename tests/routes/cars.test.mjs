import { generateDriverJWTHeader, generateRegulatorJWTHeader, generateSuperAdminJWTHeader } from '../request';
import { createDummyCampus } from '../models/campus';
import { createDummyCarModel } from '../models/car-model';
import Car, { generateDummyCar } from '../models/car';
import {
  testCreate, testCreateUnicity, testDelete, testList, testGet, testUpdate, testBatch,
} from '../helpers/crud';

const config = {
  route: '/cars',
  async generateDummyObject() {
    const toDropLater = [];

    const campus = await createDummyCampus();
    toDropLater.push(campus);

    const carModel = await createDummyCarModel();
    toDropLater.push(carModel);

    const dummyCar = await generateDummyCar({ campus, model: carModel });

    return [dummyCar, toDropLater];
  },
  cannotCall: [generateDriverJWTHeader],
  canCall: [generateRegulatorJWTHeader, generateSuperAdminJWTHeader],
};

describe('Test the car API endpoint', () => {
  it(...testCreate(Car, {
    ...config,
  }));

  it(...testCreateUnicity(Car, {
    ...config,
    requestCallBack: (r) => r
      .set(...generateSuperAdminJWTHeader()),
    transformObject: {
      id: '_id', label: 'label', campus: { id: '_id', name: 'name' }, model: { id: '_id', label: 'label' },
    },
  }));

  it(...testList(Car, {
    ...config,
  }));

  it(...testDelete(Car, {
    ...config,
    route: ({ id }) => `${config.route}/${id}`,
  }));

  it(...testGet(Car, {
    ...config,
    route: ({ id }) => `${config.route}/${id}`,
  }));

  it(...testUpdate(Car, {
    ...config,
    route: ({ id }) => `${config.route}/${id}`,
  }));

  it(...testBatch(Car, {
    ...config,
    route: `${config.route}/batch`,
    queryParams: {},
    canCall: [generateSuperAdminJWTHeader],
  }));
});
