import chai from 'chai';
import request from '../../request';
import { createDummyCampus } from '../../models/campus';
import { createDummyUser } from '../../models/user';

const { expect } = chai;

describe('Test the campuses/drivers route', () => {
  it('It should response the GET method', async () => {
    const campus = await createDummyCampus();

    await Promise.all([
      async () => {
        const { text, statusCode } = await request()
          .get(`/campuses/${campus._id}/drivers`);
        expect(statusCode).to.equal(400);
        expect(text).to.contains('filters');
      },
      async () => {
        const { text, statusCode } = await request()
          .get(`/campuses/${campus._id}/drivers`)
          .query({ filters: true });
        expect(statusCode).to.equal(400);
        expect(text).to.contains('filter is required');
      },
      async () => {
        const { body, statusCode } = await request()
          .get(`/campuses/${campus._id}/drivers`)
          .query({
            filters: {
              start: new Date(),
              end: new Date(),
            },
          });
        expect(statusCode).to.equal(200);
        expect(body).to.be.empty;
      },
    ].map(fn => fn()));
  });

  it('/driver_id/rides should response the GET method', async () => {
    const campus = createDummyCampus();
    const user = await createDummyUser();

    await Promise.all([
      async () => {
        const { text, statusCode } = await request()
          .get(`/campuses/${campus._id}/drivers/${user._id}/rides`);
        expect(statusCode).to.equal(400);
        expect(text).to.contains('filters');
      },
      async () => {
        const { text, statusCode } = await request()
          .get(`/campuses/${campus._id}/drivers/${user._id}/rides`)
          .query({ filters: true });
        expect(statusCode).to.equal(400);
        expect(text).to.contains('filter is required');
      },
      async () => {
        const { statusCode } = await request()
          .get(`/campuses/${campus._id}/drivers/${user._id}/rides`)
          .query({
            filters: {
              status: true,
            },
          });
        expect(statusCode).to.equal(200);
      },
    ].map(fn => fn()));
  });
});
