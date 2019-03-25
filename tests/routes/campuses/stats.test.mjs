import chai from 'chai';
import request, { generateRegulatorJWTHeader } from '../../request';
import { createDummyCampus } from '../../models/campus';

const { expect } = chai;

describe('Test the campuses/stats route', () => {
  it('It should response the GET method', async () => {
    const campus = await createDummyCampus();
    await Promise.all([
      async () => {
        const { text, statusCode } = await request()
          .get(`/campuses/${campus._id}/stats`)
          .set(...generateRegulatorJWTHeader(campus));
        expect(statusCode).to.equal(400);
        expect(text).to.contains('filters');
      },
      async () => {
        const { text, statusCode } = await request()
          .get(`/campuses/${campus._id}/stats`)
          .set(...generateRegulatorJWTHeader(campus))
          .query({ filters: true });
        expect(statusCode).to.equal(400);
        expect(text).to.contains('filter is required');
      },
      async () => {
        const { body, statusCode } = await request()
          .get(`/campuses/${campus._id}/stats`)
          .set(...generateRegulatorJWTHeader(campus))
          .query({
            filters: {
              start: new Date(),
              end: new Date(),
            },
          });
        expect(statusCode).to.equal(200);
        expect(body).to.be.empty;
      },
      async () => {
        const { body, statusCode } = await request()
          .get(`/campuses/${campus._id}/stats`)
          .set(...generateRegulatorJWTHeader(campus))
          .query({
            filters: {
              start: new Date(),
              end: new Date(),
            },
            mask: 'total',
          });
        expect(statusCode).to.equal(200);
        expect(body).to.have.all.keys('total');
      },
    ].map(fn => fn()));
  });
});
