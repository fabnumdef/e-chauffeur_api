import chai from 'chai';
import request, { generateSuperAdminJWTHeader, generateRegulatorJWTHeader } from '../request';
import Campus, { generateDummyCampus } from '../models/campus';
import { testCreateUnicity } from '../helpers/abstract-route';

const { expect } = chai;

const config = {
  route: '/campuses',
};

describe('Test the campus route', () => {
  it(...testCreateUnicity(Campus, {
    ...config,
    dummy: generateDummyCampus,
    requestCallBack: r => r
      .set(...generateSuperAdminJWTHeader()),
    transformObject: { id: '_id', name: 'name' },
  }));

  it('It should response the GET method', async () => {
    const { body: list, statusCode } = await request()
      .get('/campuses')
      .set(...generateRegulatorJWTHeader());
    expect(statusCode).to.equal(200);
    expect(Array.isArray(list)).to.be.true;
  });
});
