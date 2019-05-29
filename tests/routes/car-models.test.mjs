import {
  generateDriverJWTHeader,
  generateRegulatorJWTHeader,
  generateSuperAdminJWTHeader,
} from '../request';
import CarModel, { generateDummyCarModel } from '../models/car-model';
import {
  testCreate, testCreateUnicity, testDelete, testList, testGet, testUpdate,
} from '../helpers/crud';


const config = {
  route: '/car-models',
  generateDummyObject: generateDummyCarModel,
};

describe('Test the car-models API endpoint', () => {
  it(...testCreate(CarModel, {
    ...config,
    cannotCall: [generateRegulatorJWTHeader, generateDriverJWTHeader],
    canCall: [generateSuperAdminJWTHeader],
  }));

  it(...testCreateUnicity(CarModel, {
    ...config,
    requestCallBack: r => r
      .set(...generateSuperAdminJWTHeader()),
    transformObject: { id: '_id', label: 'label' },
  }));

  it(...testList(CarModel, {
    ...config,
    canCall: [generateDriverJWTHeader],
  }));

  it(...testDelete(CarModel, {
    ...config,
    route: ({ id }) => `${config.route}/${id}`,
    cannotCall: [generateRegulatorJWTHeader, generateDriverJWTHeader],
    canCall: [generateSuperAdminJWTHeader],
  }));

  it(...testGet(CarModel, {
    ...config,
    route: ({ id }) => `${config.route}/${id}`,
    canCall: [generateDriverJWTHeader],
  }));

  it(...testUpdate(CarModel, {
    ...config,
    route: ({ id }) => `${config.route}/${id}`,
    cannotCall: [generateRegulatorJWTHeader, generateDriverJWTHeader],
    canCall: [generateSuperAdminJWTHeader],
  }));
});
