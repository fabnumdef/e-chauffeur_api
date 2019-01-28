import mongoose from 'mongoose';
import stateMachinePlugin from '@rentspree/mongoose-state-machine';
import stateMachine from './status';

const { Schema } = mongoose;

const RideSchema = new Schema({
  status: String,
  start: Date,
  end: Date,
  departure: {
    _id: { type: String, required: true },
    label: String,
  },
  arrival: {
    _id: { type: String, required: true },
    label: String,
  },
  driver: {
    _id: { type: Schema.ObjectId, required: true },
    name: String,
  },
  car: {
    _id: { type: String, required: true },
    label: String,
  },
  campus: {
    _id: { type: String, required: true },
  },
  comments: String,
  passengersCount: Number,
  phone: String,
});

RideSchema.plugin(stateMachinePlugin.default, { stateMachine });

RideSchema.virtual('campus.id')
  .get(function get() {
    return this.campus._id;
  })
  .set(function set(id) {
    this.campus._id = id;
  });

RideSchema.virtual('departure.id')
  .get(function get() {
    return this.departure._id;
  })
  .set(function set(id) {
    this.departure._id = id;
  });

RideSchema.virtual('arrival.id')
  .get(function get() {
    return this.arrival._id;
  })
  .set(function set(id) {
    this.arrival._id = id;
  });

RideSchema.virtual('car.id')
  .get(function get() {
    return this.car._id;
  })
  .set(function set(id) {
    this.car._id = id;
  });

RideSchema.virtual('driver.id')
  .get(function get() {
    return this.driver._id;
  })
  .set(function set(id) {
    this.driver._id = id;
  });

RideSchema.statics.filtersWithin = function filtersWithin(start, end, f = {}) {
  const filters = f;
  filters.$or = [
    {
      start: {
        $lte: start,
      },
      end: {
        $gte: start,
        $lte: end,
      },
    },
    {
      start: {
        $gte: start,
        $lte: end,
      },
      end: {
        $gte: end,
      },
    },
    {
      start: {
        $lte: start,
      },
      end: {
        $gte: end,
      },
    },
    {
      start: {
        $gte: start,
        $lte: end,
      },
      end: {
        $gte: start,
        $lte: end,
      },
    },
  ];
  return filters;
};

RideSchema.statics.findWithin = function findWithin(start, end, filters = {}, ...rest) {
  return this.find(
    this.filtersWithin(start, end, filters),
    ...rest,
  );
};

RideSchema.statics.countDocumentsWithin = function countDocumentsWithin(start, end, filters = {}, ...rest) {
  return this.countDocuments(
    this.filtersWithin(start, end, filters),
    ...rest,
  );
};

export default mongoose.model('Ride', RideSchema);
