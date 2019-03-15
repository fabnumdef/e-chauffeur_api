import chai from 'chai';
import request, { generateUserJWTHeader } from '../request';
import { cleanObject } from '../../middlewares/mask-output';
import User, { generateDummyUser } from '../models/user';

const { expect } = chai;

describe('Test the user API endpoint', () => {
  it('POST API endpoint should create a new user', async () => {
    const dummyUser = generateDummyUser();
    try {
      {
        const response = await request()
          .post('/users')
          .set(...generateUserJWTHeader('canCreateUser'))
          .send(cleanObject(dummyUser));
        expect(response.statusCode).to.equal(200);

        const user = await User
          .find(dummyUser)
          .lean();
        expect(user).to.not.be.null;
      }
      {
        const { statusCode } = await request()
          .post('/users')
          .set(...generateUserJWTHeader('canCreateUser'))
          .send(cleanObject(dummyUser));
        expect(statusCode).to.equal(409);
      }
    } finally {
      await User.deleteOne({ _id: dummyUser._id });
    }
  });
});
