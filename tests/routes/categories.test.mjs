import chai from 'chai';
import request, { generateSuperAdminJWTHeader } from '../request';
import { cleanObject } from '../../middlewares/mask-output';
import Category, { generateDummyCategory } from '../models/category';

const { expect } = chai;

describe('Test the category API endpoint', () => {
  it('POST API endpoint should create a new category', async () => {
    const dummyCategory = generateDummyCategory();
    try {
      {
        const response = await request()
          .post('/categories')
          .set(...generateSuperAdminJWTHeader())
          .send(cleanObject(dummyCategory));
        expect(response.statusCode).to.equal(200);

        const category = await Category
          .find(dummyCategory)
          .lean();
        expect(category).to.not.be.null;
      }
      {
        const { statusCode } = await request()
          .post('/categories')
          .set(...generateSuperAdminJWTHeader())
          .send(cleanObject(dummyCategory));
        expect(statusCode).to.equal(409);
      }
    } finally {
      await Category.deleteOne({ _id: dummyCategory._id });
    }
  });
});
