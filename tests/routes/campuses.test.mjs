import {
  generateSuperAdminJWTHeader,
  generateRegulatorJWTHeader,
  generateDriverJWTHeader,
  generateAnonymousJWTHeader,
} from '../request';
import Campus, { generateDummyCampus } from '../models/campus';
import {
  testCreate, testCreateUnicity, testDelete, testList, testGet, testUpdate,
} from '../helpers/crud';

const config = {
  route: '/campuses',
  generateDummyObject: generateDummyCampus,
};

describe('Test the campuses route', () => {
  it(...testCreate(Campus, {
    ...config,
    cannotCall: [generateRegulatorJWTHeader, generateDriverJWTHeader],
    canCall: [generateSuperAdminJWTHeader],
  }));

  it(...testCreateUnicity(Campus, {
    ...config,
    requestCallBack: r => r
      .set(...generateSuperAdminJWTHeader()),
    transformObject: { id: '_id', name: 'name' },
  }));

  it(...testList(Campus, {
    ...config,
    canCall: [generateAnonymousJWTHeader],
  }));

  it(...testDelete(Campus, {
    ...config,
    route: ({ id }) => `${config.route}/${id}`,
    cannotCall: [generateRegulatorJWTHeader, generateDriverJWTHeader],
    canCall: [generateSuperAdminJWTHeader],
  }));

  it(...testGet(Campus, {
    ...config,
    route: ({ id }) => `${config.route}/${id}`,
    canCall: [generateDriverJWTHeader],
  }));

  it(...testUpdate(Campus, {
    ...config,
    route: ({ id }) => `${config.route}/${id}`,
    cannotCall: [generateRegulatorJWTHeader, generateDriverJWTHeader],
    canCall: [generateSuperAdminJWTHeader],
  }));
});
