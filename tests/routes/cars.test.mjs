import { generateDriverJWTHeader, generateRegulatorJWTHeader, generateSuperAdminJWTHeader } from '../request';
import { createDummyCampus, generateDummyCampus } from '../models/campus';
import { createDummyCarModel } from '../models/car-model';
import Car, { generateDummyCar } from '../models/car';
import {
  testCreate, testCreateUnicity, testDelete, testList, testGet, testUpdate,
} from '../helpers/crud';

const dummyCampus = generateDummyCampus();

const config = {
  route: '/cars',
  queryParams: {
    filters: {
      campus: dummyCampus._id,
    },
  },
  async generateDummyObject() {
    const toDropLater = [];

    const campus = await createDummyCampus(dummyCampus);
    toDropLater.push(campus);

    const model = await createDummyCarModel();
    toDropLater.push(model);

    const dummyCar = await generateDummyCar({ campus, model });

    return [dummyCar, toDropLater];
  },
  cannotCall: [generateRegulatorJWTHeader.bind(null, generateDummyCampus()), generateDriverJWTHeader],
  canCall: [generateRegulatorJWTHeader.bind(null, dummyCampus), generateSuperAdminJWTHeader],
};

describe('Test the car API endpoint', () => {
  it(...testCreate(Car, {
    ...config,
  }));

  it(...testCreateUnicity(Car, {
    ...config,
    requestCallBack: (r) => r
      .set(...generateSuperAdminJWTHeader()),
    transformObject: {
      id: '_id', label: 'label', campus: { id: '_id', name: 'name' }, model: { id: '_id', label: 'label' },
    },
  }));

  it(...testList(Car, {
    ...config,
  }));

  it(...testDelete(Car, {
    ...config,
    route: ({ id }) => `${config.route}/${id}`,
  }));

  it(...testGet(Car, {
    ...config,
    route: ({ id }) => `${config.route}/${id}`,
  }));

  it(...testUpdate(Car, {
    ...config,
    route: ({ id }) => `${config.route}/${id}`,
  }));
});
