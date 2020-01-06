import {
  generateDriverJWTHeader,
  generateRegulatorJWTHeader,
  generateSuperAdminJWTHeader,
} from '../request';
import PhoneModel, { generateDummyPhoneModel } from '../models/phone-model';
import {
  testCreate, testCreateUnicity, testDelete, testList, testGet, testUpdate, testBatch,
} from '../helpers/crud';


const config = {
  route: '/phone-models',
  generateDummyObject: generateDummyPhoneModel,
  cannotCall: [generateRegulatorJWTHeader, generateDriverJWTHeader],
  canCall: [generateSuperAdminJWTHeader],
};

describe('Test the phone-models API endpoint', () => {
  it(...testCreate(PhoneModel, {
    ...config,
  }));

  it(...testCreateUnicity(PhoneModel, {
    ...config,
    requestCallBack: (r) => r
      .set(...generateSuperAdminJWTHeader()),
    transformObject: { id: '_id', label: 'label' },
  }));

  it(...testList(PhoneModel, {
    ...config,
    cannotCall: [generateDriverJWTHeader],
    canCall: [generateRegulatorJWTHeader, generateSuperAdminJWTHeader],
  }));

  it(...testDelete(PhoneModel, {
    ...config,
    route: ({ id }) => `${config.route}/${id}`,
  }));

  it(...testGet(PhoneModel, {
    ...config,
    cannotCall: [generateDriverJWTHeader],
    canCall: [generateRegulatorJWTHeader, generateSuperAdminJWTHeader],
    route: ({ id }) => `${config.route}/${id}`,
  }));

  it(...testUpdate(PhoneModel, {
    ...config,
    route: ({ id }) => `${config.route}/${id}`,
  }));

  it(...testBatch(PhoneModel, {
    ...config,
    route: `${config.route}/batch`,
  }));
});
