import {
  generateAdminJWTHeader as originalGenerateAdminJWTHeader,
  generateRegulatorJWTHeader as originalGenerateRegulatorJWTHeader,
  generateDriverJWTHeader,
  generateSuperAdminJWTHeader,
} from '../request';
import Campus, { generateDummyCampus } from '../models/campus';
import Poi, { generateDummyPoi } from '../models/poi';
import {
  testCreate, testCreateUnicity, testDelete, testList, testGet, testUpdate,
} from '../helpers/crud';

const campus = generateDummyCampus();

const generateAdminJWTHeader = originalGenerateAdminJWTHeader.bind(null, campus);
const generateRegulatorJWTHeader = originalGenerateRegulatorJWTHeader.bind(null, campus);

const config = {
  route: '/pois',
  queryParams: {
    filters: {
      campus: campus._id,
    },
  },
  async generateDummyObject() {
    const toDropLater = [];

    const dummyPoi = await generateDummyPoi({ campus });

    return [dummyPoi, toDropLater];
  },
  cannotCall: [generateDriverJWTHeader],
  canCall: [generateAdminJWTHeader, generateSuperAdminJWTHeader],
};

describe('Test the poi API endpoint', () => {
  before(async () => {
    await Campus.create(campus);
  });

  after(async () => {
    await Campus.deleteOne(campus);
  });

  it(...testCreate(Poi, {
    ...config,
  }));

  it(...testCreateUnicity(Poi, {
    ...config,
    requestCallBack: (r) => r
      .set(...generateAdminJWTHeader()),
    transformObject: {
      id: '_id',
      label: 'label',
      campus: { id: '_id', name: 'name' },
    },
  }));

  it(...testList(Poi, {
    ...config,
    canCall: config.canCall.concat(generateRegulatorJWTHeader),
  }));

  it(...testDelete(Poi, {
    ...config,
    route: ({ id }) => `${config.route}/${id}`,
  }));

  it(...testGet(Poi, {
    ...config,
    canCall: config.canCall.concat(generateRegulatorJWTHeader),
    route: ({ id }) => `${config.route}/${id}`,
  }));

  it(...testUpdate(Poi, {
    ...config,
    route: ({ id }) => `${config.route}/${id}`,
  }));
});
