import mongoose from 'mongoose';
import createdAtPlugin from './helpers/created-at';

export const WEEKLY = 'weekly';
export const MONTHLY = 'monthly';

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
      enum: [WEEKLY, MONTHLY],
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
    throw new Error('Frequency is required when recurrence is enabled.');
  }
  next();
});

TimeSlotSchema.statics.getDashedName = () => 'time-slot';

TimeSlotSchema.statics.filtersWithin = function filtersWithin(after, before, f = {}) {
  const filters = f;
  filters.$or = [
    {
      start: {
        $lt: before,
      },
      end: {
        $gt: after,
      },
    },
  ];
  return filters;
};

TimeSlotSchema.statics.findWithin = function findWithin(after, before, filters = {}, ...rest) {
  return this.find(
    this.filtersWithin(after, before, filters),
    ...rest,
  );
};

TimeSlotSchema.statics.countDocumentsWithin = function countDocumentsWithin(after, before, filters = {}, ...rest) {
  return this.countDocuments(
    this.filtersWithin(after, before, filters),
    ...rest,
  );
};
export default mongoose.model('TimeSlot', TimeSlotSchema, 'time-slots');
