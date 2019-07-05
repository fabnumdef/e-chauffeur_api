import { generateAdminJWTHeader as originalGenerateAdminJWTHeader, generateDriverJWTHeader } from '../request';
import Campus, { generateDummyCampus } from '../models/campus';
import { createDummyPhoneModel } from '../models/phone-model';
import Phone, { generateDummyPhone } from '../models/phone';
import {
  testCreate, testCreateUnicity, testDelete, testList, testGet, testUpdate,
} from '../helpers/crud';

const campus = generateDummyCampus();

const generateAdminJWTHeader = originalGenerateAdminJWTHeader.bind(null, campus);

const config = {
  route: '/phones',
  queryParams: {
    filters: {
      campus: campus._id,
    },
  },
  async generateDummyObject() {
    const toDropLater = [];

    const phoneModel = await createDummyPhoneModel();
    toDropLater.push(phoneModel);

    const dummyPhone = await generateDummyPhone({ campus, model: phoneModel });

    return [dummyPhone, toDropLater];
  },
  cannotCall: [generateDriverJWTHeader],
  canCall: [generateAdminJWTHeader],
};

describe('Test the phone API endpoint', () => {
  before(async () => {
    await Campus.create(campus);
  });

  after(async () => {
    await Campus.deleteOne(campus);
  });

  it(...testCreate(Phone, {
    ...config,
  }));

  it(...testCreateUnicity(Phone, {
    ...config,
    requestCallBack: r => r
      .set(...generateAdminJWTHeader()),
    transformObject: {
      id: '_id',
      label: 'label',
      number: 'number',
      imei: 'imei',
      campus: { id: '_id', name: 'name' },
      model: { id: '_id', label: 'label' },
    },
  }));

  it(...testList(Phone, {
    ...config,
  }));

  it(...testDelete(Phone, {
    ...config,
    route: ({ id }) => `${config.route}/${id}`,
  }));

  it(...testGet(Phone, {
    ...config,
    route: ({ id }) => `${config.route}/${id}`,
  }));

  it(...testUpdate(Phone, {
    ...config,
    route: ({ id }) => `${config.route}/${id}`,
  }));
});
