import mongoose from 'mongoose';
import nanoid from 'nanoid';
import stateMachinePlugin from '@rentspree/mongoose-state-machine';
import stateMachine, { CREATED } from './status';

const { Schema, Types } = mongoose;

const RideSchema = new Schema({
  token: {
    type: String,
    default: () => nanoid(48),
  },
  status: { type: String, default: CREATED },
  statusChanges: [{
    _id: false,
    status: { type: String, required: true },
    time: Date,
  }],
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
    model: {
      _id: { type: String, required: true },
      label: { type: String, required: true },
    },
  },
  campus: {
    _id: { type: String, required: true },
  },
  comments: String,
  passengersCount: Number,
  phone: String,
});

RideSchema.plugin(stateMachinePlugin.default, { stateMachine });

RideSchema.pre('validate', async function beforeSave() {
  const Car = mongoose.model('Car');
  const carId = this.car._id;
  this.car = await Car.findById(carId).lean();
});

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

RideSchema.statics.castId = (v) => {
  try {
    return new Types.ObjectId(v);
  } catch (e) {
    return new Types.ObjectId(Buffer.from(v, 'base64').toString('hex'));
  }
};

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

RideSchema.methods.isAccessibleByAnonymous = function isAccessibleByAnonymous(token) {
  return this.token === token;
};

RideSchema.methods.findDriverPosition = async function findDriverPosition(date) {
  const GeoTracking = mongoose.model('GeoTracking');
  const [position = null] = await GeoTracking.aggregate([
    { $unwind: '$positions' },
    {
      $project: {
        driver: '$driver._id',
        position: '$positions.location',
        date: '$positions._id',
      },
    },
    { $sort: { date: -1 } },
    { $limit: 1 },
  ]);
  return position;
};

export default mongoose.model('Ride', RideSchema);
