import {
  testCreate, testList,
} from '../helpers/crud';
import Rating, { generateDummyRating } from '../models/rating';
import {
  generateSuperAdminJWTHeader,
  generateAdminJWTHeader,
  generateAnonymousJWTHeader,
} from '../request';

const config = {
  route: '/ratings',
  generateDummyObject: generateDummyRating,
};

describe('Test the rating API endpoint', () => {
  it(...testCreate(Rating, {
    ...config,
    canCall: [generateAnonymousJWTHeader],
  }));
  it(...testList(Rating, {
    ...config,
    cannotCall: [generateAdminJWTHeader],
    canCall: [generateSuperAdminJWTHeader],
  }));
});
