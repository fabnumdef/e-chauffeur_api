import mongoose from 'mongoose';
import services from '../services';
import TimeSlot from '../models/time-slot';

(async () => {
  /* eslint-disable camelcase */
  await services;
  const slots = await TimeSlot.findSlotsToCopy();
  await Promise.all(slots.map((slot) => {
    process.stdout.write(`Create next hop after time-slot "${slot._id}"`);
    process.stdout.clearLine();
    process.stdout.cursorTo(0);
    return slot.createNextHop();
  }));
  process.stdout.write('Done \n');
  await mongoose.disconnect();
})();
