import chai from 'chai';
import request, { generateRegulatorJWTHeader } from '../../request';
import { createDummyCampus } from '../../models/campus';

const { expect } = chai;

describe('Test the campuses/cars route', () => {
  it('It should response the GET method', async () => {
    const campus = await createDummyCampus();
    await Promise.all([
      async () => {
        const { text, statusCode } = await request()
          .get(`/campuses/${campus._id}/cars`)
          .set(...generateRegulatorJWTHeader(campus));
        expect(statusCode).to.equal(400);
        expect(text).to.contains('filters');
      },
      async () => {
        const { text, statusCode } = await request()
          .get(`/campuses/${campus._id}/cars`)
          .set(...generateRegulatorJWTHeader(campus))
          .query({ filters: true });
        expect(statusCode).to.equal(400);
        expect(text).to.contains('filter is required');
      },
      async () => {
        const { body, statusCode } = await request()
          .get(`/campuses/${campus._id}/cars`)
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
    ].map((fn) => fn()));
  });
});
