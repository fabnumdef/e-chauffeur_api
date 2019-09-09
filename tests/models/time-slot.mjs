import mongoose from 'mongoose';
import TimeSlot from '../../models/time-slot';

const { Types: { ObjectId } } = mongoose;

export const generateDummyTimeSlot = (params) => ({
  _id: new ObjectId(),
  start: new Date(),
  end: new Date(),
  ...params,
});

export default TimeSlot;
