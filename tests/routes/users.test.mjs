import chai from 'chai';
import request, {
  generateSuperAdminJWTHeader,
  generateDriverJWTHeader,
  generateUserJWTHeader,
} from '../request';
import User, { generateDummyUser } from '../models/user';
import {
  testCreate, testDelete, testList, testGet, testUpdate,
} from '../helpers/crud';

const { expect } = chai;
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

  it('User should be able to edit self password/name', async () => {
    const dummyUser = generateDummyUser();
    const user = await User.create(dummyUser);
    try {
      {
        const { statusCode } = await request()
          .patch(`/users/${user.id}`)
          .set(...generateUserJWTHeader());
        expect(statusCode).to.equal(403);
      }
      {
        const { statusCode } = await request()
          .patch(`/users/${user.id}`)
          .set('Authorization', `Bearer ${user.emitJWT()}`);
        expect(statusCode).to.equal(200);
      }
    } finally {
      await User.deleteOne(dummyUser);
    }
  });
});
