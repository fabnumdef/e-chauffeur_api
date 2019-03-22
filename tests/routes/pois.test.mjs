import chai from 'chai';
import request, { generateSuperAdminJWTHeader } from '../request';
import { cleanObject } from '../../middlewares/mask-output';
import Poi, { generateDummyPoi } from '../models/poi';

const { expect } = chai;

describe('Test the poi API endpoint', () => {
  it('POST API endpoint should create a new poi', async () => {
    const dummyPoi = generateDummyPoi();
    try {
      {
        const response = await request()
          .post('/pois')
          .set(...generateSuperAdminJWTHeader())
          .send(cleanObject(dummyPoi));
        expect(response.statusCode).to.equal(200);

        const poi = await Poi
          .find(dummyPoi)
          .lean();
        expect(poi).to.not.be.null;
      }
      {
        const { statusCode } = await request()
          .post('/pois')
          .set(...generateSuperAdminJWTHeader())
          .send(cleanObject(dummyPoi));
        expect(statusCode).to.equal(409);
      }
    } finally {
      await Poi.deleteOne({ _id: dummyPoi._id });
    }
  });
});
