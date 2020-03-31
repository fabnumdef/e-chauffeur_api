import { createDummyCampus, generateDummyCampus } from '../../models/campus';
import {
  generateDriverJWTHeader,
  generateRegulatorJWTHeader,
} from '../../request';
import { testCreate } from '../../helpers/crud/create';
import LoopTimeSlot, { generateDummyLoopTimeSlot } from '../../models/loop/time-slot';
import { testList } from '../../helpers/crud/list';
import { testDelete } from '../../helpers/crud/delete';
import { testUpdate } from '../../helpers/crud/update';
import { createDummyLoopPattern } from '../../models/loop/pattern';
import { createDummyPoi } from '../../models/poi';

const dummyCampus = generateDummyCampus();
const config = {
  route: '/loop-time-slots',
  queryParams: {
    filters: {
      campus: dummyCampus._id,
      after: new Date(),
      before: new Date(),
    },
  },
  async generateDummyObject() {
    const campus = await createDummyCampus(dummyCampus);
    const dummyStopA = await createDummyPoi();
    const dummyStopB = await createDummyPoi();

    const stops = [{ poi: dummyStopA }, { poi: dummyStopB }];
    const dummyLoopPattern = await createDummyLoopPattern({ campus, stops });

    const dummyLoopTimeSlot = generateDummyLoopTimeSlot({ pattern: { id: dummyLoopPattern.id } });
    const toDropLater = [
      campus,
      dummyLoopPattern,
      dummyStopA, dummyStopB,
    ];

    return [dummyLoopTimeSlot, toDropLater];
  },
  cannotCall: [generateDriverJWTHeader],
  canCall: [generateRegulatorJWTHeader.bind(null, dummyCampus)],
};

describe('Test the loop time slots API endpoint', () => {
  it(...testCreate(LoopTimeSlot, {
    ...config,
  }));

  it(...testList(LoopTimeSlot, {
    ...config,
  }));

  it(...testDelete(LoopTimeSlot, {
    ...config,
    route: ({ id }) => `${config.route}/${id}`,
  }));

  it(...testUpdate(LoopTimeSlot, {
    ...config,
    route: ({ id }) => `${config.route}/${id}`,
  }));
});
