import chai from 'chai';
import request, { generateSuperAdminJWTHeader, generateRegulatorJWTHeader } from '../request';
import Campus, { generateDummyCampus } from '../models/campus';

const { expect } = chai;

describe('Test the campus route', () => {
  it('POST API endpoint should return an error when the campus already exists', async () => {
    const dummyCampus = new Campus(generateDummyCampus());
    try {
      {
        const { body: campus, statusCode } = await request()
          .post('/campuses')
          .set(...generateSuperAdminJWTHeader())
          .query({ mask: 'id,name' })
          .send({
            id: dummyCampus._id,
            name: dummyCampus.name,
          });
        expect(statusCode).to.equal(200);
        expect(campus.id).to.equal(dummyCampus._id);
        expect(campus.name).to.equal(dummyCampus.name);
        const campusFound = await Campus
          .findById(dummyCampus._id)
          .lean();
        expect(campusFound).to.not.be.null;
      }
      {
        const { statusCode } = await request()
          .post('/campuses')
          .set(...generateSuperAdminJWTHeader())
          .send({
            id: dummyCampus._id,
            name: dummyCampus.name,
          });
        expect(statusCode).to.equal(409);
      }
    } finally {
      await dummyCampus.remove();
    }
  });

  it('It should response the GET method', async () => {
    const { body: list, statusCode } = await request()
      .get('/campuses')
      .set(...generateRegulatorJWTHeader());
    expect(statusCode).to.equal(200);
    expect(Array.isArray(list)).to.be.true;
  });
});
