import nanoid from 'nanoid';
import { generateRegulatorJWTHeader, generateSuperAdminJWTHeader } from '../request';
import { testCreate } from '../helpers/crud/create';
import ShuttleFactory, { generateDummyShuttleFactory } from '../models/shuttle-factory';
import { testList } from '../helpers/crud/list';
import { testDelete } from '../helpers/crud/delete';
import { testGet } from '../helpers/crud/get';
import { testUpdate } from '../helpers/crud/update';
import { createDummyCampus, generateDummyCampus } from '../models/campus';

const dummyCampus = generateDummyCampus();
const config = {
  route: '/shuttle-factories',
  queryParams: {
    filters: {
      campus: dummyCampus._id,
    },
  },
  generateDummyObject: async () => {
    const toDropLater = [];
    const campus = await createDummyCampus(dummyCampus);
    toDropLater.push(campus);
    const shuttleFactory = generateDummyShuttleFactory({
      label: nanoid(),
      campus: { id: dummyCampus._id },
    });

    return [shuttleFactory, toDropLater];
  },
  cannotCall: [generateRegulatorJWTHeader.bind(null, generateDummyCampus())],
  canCall: [generateRegulatorJWTHeader.bind(null, dummyCampus), generateSuperAdminJWTHeader],
};

describe('Test the shuttle factories route', () => {
  it(...testCreate(ShuttleFactory, {
    ...config,
  }));

  it(...testList(ShuttleFactory, {
    ...config,
  }));

  it(...testDelete(ShuttleFactory, {
    ...config,
    route: ({ id }) => `${config.route}/${id}`,
  }));

  it(...testGet(ShuttleFactory, {
    ...config,
    route: ({ id }) => `${config.route}/${id}`,
  }));

  it(...testUpdate(ShuttleFactory, {
    ...config,
    route: ({ id }) => `${config.route}/${id}`,
  }));
});
