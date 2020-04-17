import nanoid from 'nanoid';
import { generateRegulatorJWTHeader, generateSuperAdminJWTHeader } from '../request';
import { testCreate } from '../helpers/crud/create';
import Pattern, { generateDummyPattern } from '../models/pattern';
import { testList } from '../helpers/crud/list';
import { testDelete } from '../helpers/crud/delete';
import { testGet } from '../helpers/crud/get';
import { testUpdate } from '../helpers/crud/update';
import { createDummyCampus, generateDummyCampus } from '../models/campus';

const dummyCampus = generateDummyCampus();
const config = {
  route: '/patterns',
  queryParams: {
    filters: {
      campus: dummyCampus._id,
    },
  },
  generateDummyObject: async () => {
    const toDropLater = [];
    const campus = await createDummyCampus(dummyCampus);
    toDropLater.push(campus);
    const pattern = generateDummyPattern({
      label: nanoid(),
      campus: { id: dummyCampus._id },
    });

    return [pattern, toDropLater];
  },
  cannotCall: [generateRegulatorJWTHeader.bind(null, generateDummyCampus())],
  canCall: [generateRegulatorJWTHeader.bind(null, dummyCampus), generateSuperAdminJWTHeader],
};

describe('Test the patterns route', () => {
  it(...testCreate(Pattern, {
    ...config,
  }));

  it(...testList(Pattern, {
    ...config,
  }));

  it(...testDelete(Pattern, {
    ...config,
    route: ({ id }) => `${config.route}/${id}`,
  }));

  it(...testGet(Pattern, {
    ...config,
    route: ({ id }) => `${config.route}/${id}`,
  }));

  it(...testUpdate(Pattern, {
    ...config,
    route: ({ id }) => `${config.route}/${id}`,
  }));
});
