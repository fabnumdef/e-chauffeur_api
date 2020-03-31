/* import chai from 'chai';
import {
  generateAdminJWTHeader,
  generateDriverJWTHeader,
  generateSuperAdminJWTHeader,
} from '../request'; */
import {
  testCreate,
  testDelete,
  testList,
  testGet,
  testUpdate,
} from '../../helpers/crud';
import LoopPattern, { generateDummyLoopPattern } from '../../models/loop/pattern';
import { createDummyCampus, generateDummyCampus } from '../../models/campus';
import { generateDriverJWTHeader, generateRegulatorJWTHeader } from '../../request';
import { createDummyPoi } from '../../models/poi';

// const { expect } = chai;
const dummyCampus = generateDummyCampus();

const config = {
  route: '/loop-patterns',
  queryParams: {
    filters: {
      campus: dummyCampus._id,
    },
  },
  async generateDummyObject() {
    const campus = await createDummyCampus(dummyCampus);
    const dummyStopA = await createDummyPoi();
    const dummyStopB = await createDummyPoi();

    const stops = [{ poi: dummyStopA }, { poi: dummyStopB }];
    const toDropLater = [campus, dummyStopA, dummyStopB];

    const dummyLoopPattern = generateDummyLoopPattern({ campus, stops });

    return [
      dummyLoopPattern,
      toDropLater,
    ];
  },
  cannotCall: [generateRegulatorJWTHeader.bind(null, generateDummyCampus()), generateDriverJWTHeader],
  canCall: [generateRegulatorJWTHeader.bind(null, dummyCampus)],
};

describe('Test the loop patterns route', () => {
  it(...testCreate(LoopPattern, { ...config }));

  it(...testList(LoopPattern, { ...config }));

  it(...testGet(LoopPattern, {
    ...config,
    route: ({ id }) => `${config.route}/${id}`,
  }));

  it(...testUpdate(LoopPattern, {
    ...config,
    route: ({ id }) => `${config.route}/${id}`,
  }));

  it(...testDelete(LoopPattern, {
    ...config,
    route: ({ id }) => `${config.route}/${id}`,
  }));
});
