import mongoose from 'mongoose';
import Luxon from 'luxon';
import createdAtPlugin from './helpers/created-at';
import {
  TIME_SLOT_COLLECTION_NAME,
  TIME_SLOT_DASHED_NAME,
  TIME_SLOT_MODEL_NAME,
  MONTHLY, WEEKLY,
} from './helpers/constants';
import { countDocumentsWithin, filtersWithin, findWithin } from './helpers/custom-methods';
import APIError from '../helpers/api-error';

const { DateTime } = Luxon;
const { Schema } = mongoose;

const TimeSlotSchema = new Schema({
  start: {
    type: Date,
    required: true,
  },
  end: {
    type: Date,
    required: true,
  },
  cars: [{
    _id: { type: String, alias: 'id' },
    label: { type: String },
    model: {
      label: { type: String },
    },
  }],
  drivers: [{
    _id: { type: mongoose.Types.ObjectId, alias: 'id' },
    firstname: String,
    lastname: String,
  }],
  campus: {
    _id: { type: String, alias: 'campus.id' },
  },
  title: String,
  comments: String,
  recurrence: {
    enabled: Boolean,
    withData: Boolean,
    frequency: {
      type: String,
      enum: [null, WEEKLY, MONTHLY],
    },
    nextHop: {
      _id: { type: Schema.ObjectId, alias: 'recurrence.nextHop.id' },
      start: Date,
      end: Date,
      createdAt: Date,
    },
    previousHop: {
      _id: { type: Schema.ObjectId, alias: 'recurrence.previousHop.id' },
      start: Date,
      end: Date,
      createdAt: Date,
    },
  },
});

TimeSlotSchema.plugin(createdAtPlugin);

TimeSlotSchema.pre('validate', async function preValidate(next) {
  if (this.recurrence && this.recurrence.enabled && !this.recurrence.frequency) {
    throw new APIError(400, 'Frequency is required when recurrence is enabled.');
  }
  next();
});

TimeSlotSchema.statics.getDashedName = () => TIME_SLOT_DASHED_NAME;
TimeSlotSchema.statics.filtersWithin = filtersWithin;
TimeSlotSchema.statics.findWithin = findWithin;
TimeSlotSchema.statics.countDocumentsWithin = countDocumentsWithin;

TimeSlotSchema.methods.createNextHop = async function createNextHop() {
  if (!this.recurrence.enabled || (this.recurrence.nextHop || {})._id) {
    return null;
  }
  const TimeSlot = mongoose.model(TIME_SLOT_MODEL_NAME);
  let start = DateTime.fromJSDate(this.start);
  let end = DateTime.fromJSDate(this.end);
  switch (this.recurrence.frequency) {
    case WEEKLY:
      {
        const toAdd = { week: 1 };
        start = start.plus(toAdd);
        end = end.plus(toAdd);
      }
      break;
    case MONTHLY:
      {
        const toAdd = { month: 1 };
        start = start.plus(toAdd);
        end = end.plus(toAdd);
      }
      break;
    default:
      break;
  }
  const nextHop = new TimeSlot({
    start: start.toJSDate(),
    end: end.toJSDate(),
    campus: this.campus,
    title: this.title,
    comments: this.comments,
    cars: this.cars,
    drivers: this.drivers,
    recurrence: {
      previousHop: this,
      enabled: this.recurrence.enabled,
      withData: this.recurrence.withData,
      frequency: this.recurrence.frequency,
    },
  });
  this.recurrence.nextHop = await nextHop.save();
  await nextHop.addHopToQueue();
  await this.save();
  return this.recurrence.nextHop;
};

TimeSlotSchema.statics.createNextHop = async function createNextHop(id) {
  const timeSlot = await this.findOne(typeof id === 'string' ? mongoose.Types.ObjectId(id) : id);
  return timeSlot.createNextHop();
};

TimeSlotSchema.statics.findSlotsToCopy = async function findSlotsToCopy() {
  const criteria = { 'recurrence.enabled': true, 'recurrence.nextHop': null };
  const slots = await Promise.all([
    this.find({
      ...criteria,
      'recurrence.frequency': WEEKLY,
      start: { $lt: DateTime.local().toJSDate() },
    }),
    this.find({
      ...criteria,
      'recurrence.frequency': MONTHLY,
      start: { $lt: DateTime.local().plus({ month: 1 }).minus({ days: 7 }).toJSDate() },
    }),
  ]);
  return [].concat(...slots);
};

export default mongoose.model(TIME_SLOT_MODEL_NAME, TimeSlotSchema, TIME_SLOT_COLLECTION_NAME);
