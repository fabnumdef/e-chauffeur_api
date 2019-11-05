import {
  testCreate, testList,
} from '../helpers/crud';
import Rating, { generateDummyRating } from '../models/rating';
import {
  generateSuperAdminJWTHeader,
  generateAdminJWTHeader,
  generateAnonymousJWTHeader,
  generateUserJWTHeader,
} from '../request';

const config = {
  route: '/ratings',
  async generateDummyObject() {
    const toDropLater = [];

    const dummyRating = await generateDummyRating();

    return [dummyRating, toDropLater];
  },
};

describe('Test the rating API endpoint', () => {
  it(...testCreate(Rating, {
    ...config,
    canCall: [generateUserJWTHeader],
    cannotCall: [generateAnonymousJWTHeader],
  }));
  it(...testList(Rating, {
    ...config,
    cannotCall: [generateAdminJWTHeader],
    canCall: [generateSuperAdminJWTHeader],
  }));
});
