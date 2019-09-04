import mongoose from 'mongoose';
import createdAtPlugin from './helpers/created-at';

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
  drivers: [{
    _id: { type: mongoose.Types.ObjectId, alias: 'id' },
    firstname: String,
    lastname: String,
  }],
  campus: {
    _id: { type: String, alias: 'campus.id' },
  },
});

TimeSlotSchema.plugin(createdAtPlugin);

TimeSlotSchema.statics.getDashedName = () => 'time-slot';

TimeSlotSchema.statics.filtersWithin = function filtersWithin(after, before, f = {}) {
  const filters = f;
  filters.$or = [
    {
      start: {
        $lte: before,
      },
      end: {
        $gte: before,
        $lte: after,
      },
    },
    {
      start: {
        $gte: before,
        $lte: after,
      },
      end: {
        $gte: after,
      },
    },
    {
      start: {
        $lte: before,
      },
      end: {
        $gte: after,
      },
    },
    {
      start: {
        $gte: before,
        $lte: after,
      },
      end: {
        $gte: before,
        $lte: after,
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
