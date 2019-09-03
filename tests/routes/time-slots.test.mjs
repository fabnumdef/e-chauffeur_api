import {
  generateDriverJWTHeader,
  generateSuperAdminJWTHeader as originalGenerateSuperAdminJWTHeader,
  generateRegulatorJWTHeader as originalGenerateRegulatorJWTHeader,
} from '../request';
import TimeSlot, { generateDummyTimeSlot } from '../models/time-slot';
import { generateDummyCampus } from '../models/campus';
import {
  testCreate, testDelete, testList, testUpdate,
} from '../helpers/crud';

const campus = generateDummyCampus();
const generateSuperAdminJWTHeader = originalGenerateSuperAdminJWTHeader.bind(null, campus);
const generateRegulatorJWTHeader = originalGenerateRegulatorJWTHeader.bind(null, campus);
const config = {
  route: '/time-slots',
  queryParams: {
    filters: {
      campus: campus._id,
      after: new Date(),
      before: new Date(),
    },
  },
  async generateDummyObject() {
    const toDropLater = [];

    const dummyTimeSlot = generateDummyTimeSlot({ campus });
    return [dummyTimeSlot, toDropLater];
  },
  cannotCall: [generateDriverJWTHeader],
  canCall: [generateRegulatorJWTHeader, generateSuperAdminJWTHeader],
};

describe('Test the time slots API endpoint', () => {
  it(...testCreate(TimeSlot, {
    ...config,
  }));

  it(...testList(TimeSlot, {
    ...config,
  }));

  it(...testDelete(TimeSlot, {
    ...config,
    route: ({ id }) => `${config.route}/${id}`,
  }));

  it(...testUpdate(TimeSlot, {
    ...config,
    route: ({ id }) => `${config.route}/${id}`,
  }));
});
