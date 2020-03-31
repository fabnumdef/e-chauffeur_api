import { createDummyLoopTimeSlot } from '../../models/loop/time-slot';
import { testCreate } from '../../helpers/crud/create';
import { testList } from '../../helpers/crud/list';
import { testUpdate } from '../../helpers/crud/update';
import { createDummyLoopPattern } from '../../models/loop/pattern';
import { createDummyCampus, generateDummyCampus } from '../../models/campus';
import { createDummyPoi } from '../../models/poi';
import { createDummyUser } from '../../models/user';
import { createDummyCarModel } from '../../models/car-model';
import { createDummyCar } from '../../models/car';
import Loop, { generateDummyLoop } from '../../models/loop';
import { generateDriverJWTHeader, generateRegulatorJWTHeader } from '../../request';

const dummyCampus = generateDummyCampus();
const config = {
  route: '/loops',
  queryParams: {
    filters: {
      campus: dummyCampus._id,
      start: new Date(),
      end: new Date(),
    },
  },
  async generateDummyObject() {
    const campus = await createDummyCampus(dummyCampus);
    const dummyStopA = await createDummyPoi();
    const dummyStopB = await createDummyPoi();

    const stops = [{ poi: dummyStopA }, { poi: dummyStopB }];
    const dummyLoopPattern = await createDummyLoopPattern({ campus, stops });
    const dummyLoopTimeSlot = await createDummyLoopTimeSlot({ pattern: { id: dummyLoopPattern.id } });
    const dummyDriver = await createDummyUser();
    const dummyCarModel = await createDummyCarModel();
    const dummyCar = await createDummyCar({ model: dummyCarModel, campus });

    const toDropLater = [
      campus,
      dummyStopA, dummyStopB,
      dummyLoopPattern,
      dummyLoopTimeSlot,
      dummyCarModel, dummyCar,
      dummyDriver,
    ];

    const dummyLoop = generateDummyLoop({
      pattern: { id: dummyLoopPattern.id },
      timeSlot: { id: dummyLoopTimeSlot.id },
      driver: dummyDriver,
      car: dummyCar,
    });

    return [dummyLoop, toDropLater];
  },
  canCall: [generateRegulatorJWTHeader.bind(null, dummyCampus)],
  cannotCall: [generateDriverJWTHeader.bind(null, dummyCampus)],
};

describe('Test the loops API endpoint', () => {
  it(...testCreate(Loop, {
    ...config,
  }));

  it(...testList(Loop, {
    ...config,
  }));

  it(...testUpdate(Loop, {
    ...config,
    route: ({ id }) => `${config.route}/${id}`,
  }));
});
