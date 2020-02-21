import chai from 'chai';
import ValidationError from 'mongoose/lib/error/validation';
import request, {
  generateSuperAdminJWTHeader,
  generateDriverJWTHeader,
  generateUserJWTHeader,
} from '../request';
import User, { generateDummyUser } from '../models/user';
import {
  testCreate, testDelete, testList, testGet, testUpdate, testBatch,
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

  it(...testBatch(User, {
    ...config,
    route: `${config.route}/batch`,
    ref: 'email',
    queryParams: {},
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

  it('User should be able to delete his account', async () => {
    const dummyUser = generateDummyUser();
    const user = await User.create(dummyUser);
    try {
      {
        const { statusCode } = await request()
          .delete(`/users/${user.id}`)
          .set(...generateUserJWTHeader());
        expect(statusCode).to.equal(403);
      }
      {
        const { statusCode } = await request()
          .delete(`/users/${user.id}`)
          .set('Authorization', `Bearer ${user.emitJWT()}`);
        expect(statusCode).to.equal(204);
      }
    } finally {
      await User.deleteOne(dummyUser);
    }
  });

  it('It should not be possible to register too long email', async () => {
    // Reason : It's causing an issue while saving cause of index limitation
    const forgedEmail = `${'azerty'.repeat(100)}@localhost`;
    const dummyUser = generateDummyUser({ email: forgedEmail });
    try {
      expect(await User.create(dummyUser)).to.be.a('null');
    } catch (e) {
      expect(e).to.be.an.instanceof(ValidationError);
    }
  });
});
