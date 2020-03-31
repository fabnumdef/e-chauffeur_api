import LoopTimeSlop from '../../../models/loop/time-slot';

export const generateDummyLoopTimeSlot = (params) => ({
  start: new Date(),
  end: new Date(),
  ...params,
});

export const createDummyLoopTimeSlot = (params) => LoopTimeSlop.create(generateDummyLoopTimeSlot(params));

export default LoopTimeSlop;
