import chai from 'chai';
import request, { generateUserJWTHeader } from '../request';
import { cleanObject } from '../../middlewares/mask-output';
import Role, { generateDummyRole } from '../models/role';

const { expect } = chai;

describe('Test the role API endpoint', () => {
  it('POST API endpoint should create a new role', async () => {
    const dummyRole = generateDummyRole();
    try {
      {
        const response = await request()
          .post('/roles')
          .set(...generateUserJWTHeader('canCreateRole'))
          .send(cleanObject(dummyRole));
        expect(response.statusCode).to.equal(200);

        const role = await Role
          .find(dummyRole)
          .lean();
        expect(role).to.not.be.null;
      }
      {
        const { statusCode } = await request()
          .post('/roles')
          .set(...generateUserJWTHeader('canCreateRole'))
          .send(cleanObject(dummyRole));
        expect(statusCode).to.equal(409);
      }
    } finally {
      await Role.deleteOne({ _id: dummyRole._id });
    }
  });
});
