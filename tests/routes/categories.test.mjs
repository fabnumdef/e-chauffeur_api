import {
  generateDriverJWTHeader,
  generateRegulatorJWTHeader,
  generateSuperAdminJWTHeader,
} from '../request';
import Category, { generateDummyCategory } from '../models/category';
import {
  testCreate, testCreateUnicity, testDelete, testList, testGet, testUpdate,
} from '../helpers/crud';


const config = {
  route: '/categories',
  generateDummyObject: generateDummyCategory,
};

describe('Test the category API endpoint', () => {
  it(...testCreate(Category, {
    ...config,
    cannotCall: [generateRegulatorJWTHeader, generateDriverJWTHeader],
    canCall: [generateSuperAdminJWTHeader],
  }));

  it(...testCreateUnicity(Category, {
    ...config,
    requestCallBack: (r) => r
      .set(...generateSuperAdminJWTHeader()),
    transformObject: { id: '_id', label: 'label' },
  }));

  it(...testList(Category, {
    ...config,
    canCall: [generateDriverJWTHeader],
  }));

  it(...testDelete(Category, {
    ...config,
    route: ({ id }) => `${config.route}/${id}`,
    cannotCall: [generateRegulatorJWTHeader, generateDriverJWTHeader],
    canCall: [generateSuperAdminJWTHeader],
  }));

  it(...testGet(Category, {
    ...config,
    route: ({ id }) => `${config.route}/${id}`,
    cannotCall: [generateRegulatorJWTHeader, generateDriverJWTHeader],
    canCall: [generateSuperAdminJWTHeader],
  }));

  it(...testUpdate(Category, {
    ...config,
    route: ({ id }) => `${config.route}/${id}`,
    cannotCall: [generateRegulatorJWTHeader, generateDriverJWTHeader],
    canCall: [generateSuperAdminJWTHeader],
  }));
});
