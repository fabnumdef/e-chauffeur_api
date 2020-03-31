/*
* Loop time slots to fill planning for CT
* */
import mongoose from 'mongoose';
import HttpError from '../../helpers/http-error';
import {
  LOOP_TIME_SLOT_COLLECTION_NAME,
  LOOP_TIME_SLOTS_MODEL_NAME,
  MONTHLY, WEEKLY,
} from '../helpers/constants';
import { countDocumentsWithin, filtersWithin, findWithin } from '../helpers/custom-methods';

const { Schema, model, Types } = mongoose;

const LoopTimeSlotSchema = new Schema({
  start: {
    type: Date,
    required: true,
  },
  end: {
    type: Date,
    required: true,
  },
  pattern: {
    _id: {
      type: Types.ObjectId,
      alias: 'id',
    },
  },
  /*
  * Question:
  *   TimeSlot model has drivers array and cars array
  *   It would be an issue to set efficient recurrency
  *   Even more for CT, thus is it wanted ?
  * */
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
}, { timestamps: true });

LoopTimeSlotSchema.pre('validate', function preValidate(next) {
  if (this.recurrence && this.recurrence.enabled && !this.recurrence.frequency) {
    throw new HttpError(422, 'Frequency is required when recurrence is enabled.');
  }
  next();
});

LoopTimeSlotSchema.statics.filtersWithin = filtersWithin;
LoopTimeSlotSchema.statics.findWithin = findWithin;
LoopTimeSlotSchema.statics.countDocumentsWithin = countDocumentsWithin;

// @todo handle recurrency

export default model(LOOP_TIME_SLOTS_MODEL_NAME, LoopTimeSlotSchema, LOOP_TIME_SLOT_COLLECTION_NAME);
