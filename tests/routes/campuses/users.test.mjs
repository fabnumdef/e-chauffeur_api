import chai from 'chai';
import request, { generateRegulatorJWTHeader, generateAdminJWTHeader } from '../../request';
import { createDummyCampus } from '../../models/campus';
import { createDummyUser } from '../../models/user';

const { expect } = chai;

describe('Test the campuses/users route', () => {
  it('It should response the GET method', async () => {
    const campus = await createDummyCampus();

    await Promise.all([
      async () => {
        const { statusCode } = await request()
          .get(`/campuses/${campus._id}/users`)
          .set(...generateRegulatorJWTHeader(campus));
        expect(statusCode).to.equal(403);
      },
      async () => {
        const { body, statusCode } = await request()
          .get(`/campuses/${campus._id}/users`)
          .set(...generateAdminJWTHeader(campus));
        expect(statusCode).to.equal(200);
        expect(body).to.be.empty;
      },
    ].map((fn) => fn()));
  });

  it('/user_id/ should response the GET method', async () => {
    const campus = await createDummyCampus();
    const user = await createDummyUser();
    await Promise.all([
      async () => {
        const { statusCode } = await request()
          .get(`/campuses/${campus._id}/users/${user._id}`)
          .set(...generateRegulatorJWTHeader(campus));
        expect(statusCode).to.equal(403);
      },
      async () => {
        const { statusCode } = await request()
          .get(`/campuses/${campus._id}/users/${user._id}`)
          .set(...generateAdminJWTHeader(campus));
        expect(statusCode).to.equal(404);
      },
    ].map((fn) => fn()));
  });
});
