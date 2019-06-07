import {
  generateSuperAdminJWTHeader,
  generateDriverJWTHeader,
} from '../request';
import User, { generateDummyUser } from '../models/user';
import {
  testCreate, testDelete, testList, testGet, testUpdate,
} from '../helpers/crud';

const config = {
  route: '/users',
  generateDummyObject: generateDummyUser,
  cannotCall: [generateDriverJWTHeader],
  canCall: [generateSuperAdminJWTHeader],
};

describe('Test the users route', () => {
  it(...testCreate(User, {
    ...config,
  }));

  it(...testList(User, {
    ...config,
  }));

  it(...testDelete(User, {
    ...config,
    route: ({ id }) => `${config.route}/${id}`,
  }));

  it(...testGet(User, {
    ...config,
    route: ({ id }) => `${config.route}/${id}`,
  }));

  it(...testUpdate(User, {
    ...config,
    route: ({ id }) => `${config.route}/${id}`,
  }));
});
