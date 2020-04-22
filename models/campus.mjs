import mongoose from 'mongoose';
import timezoneValidator from 'timezone-validator';
import createdAtPlugin from './helpers/created-at';
import { DRAFTED } from './status';
import config from '../services/config';
import {
  USER_MODEL_NAME,
  RIDE_MODEL_NAME,
  RATING_MODEL_NAME,
  CAMPUS_MODEL_NAME,
  TIME_SLOT_MODEL_NAME,
  CAR_MODEL_NAME,
  CAMPUS_COLLECTION_NAME,
} from './helpers/constants';

const DEFAULT_TIMEZONE = config.get('default_timezone');
const { Schema } = mongoose;

const CampusSchema = new Schema({
  _id: { type: String, required: true },
  name: { type: String, required: true },
  categories: [{
    _id: { type: String, required: true, alias: 'id' },
    label: String,
  }],
  workedDays: {
    type: [{
      // 1-7, where 1 is Monday and 7 is Sunday (ISO 8601)
      type: Number,
      min: 1,
      max: 7,
    }],
    default: [1, 2, 3, 4, 5],
  },
  workedHours: {
    start: {
      type: Number,
      min: 0,
      max: 24,
      default: 5,
    },
    end: {
      type: Number,
      min: 0,
      max: 24,
      default: 23,
    },
  },
  defaultRideDuration: {
    type: Number,
    enum: [15, 20, 30, 60],
    default: 30,
  },
  defaultReservationScope: {
    type: Number,
    default: 3600,
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
    },
    coordinates: {
      type: [Number],
      required: true,
      validate(v) {
        return v.length === 2;
      },
      message: () => 'invalid_coordinates',
    },
  },
  phone: {
    drivers: String,
    everybody: String,
  },
  timezone: {
    type: String,
    default: process.env.TZ || DEFAULT_TIMEZONE,
    validate: {
      validator(v) {
        return !v || timezoneValidator(v);
      },
      message: () => 'invalid_timezone',
    },
  },
});

CampusSchema.plugin(createdAtPlugin);

CampusSchema.index({
  _id: 'text',
  name: 'text',
  'phone.everybody': 'text',
  'categories._id': 'text',
  'categories.label': 'text',
});

const campusFilter = (campus) => ({
  'roles.campuses._id': campus,
});

const driverFilter = () => ({
  'roles.role': 'ROLE_DRIVER',
});

CampusSchema.statics.countUsers = async function countUsers(campus, filters = {}) {
  const User = mongoose.model(USER_MODEL_NAME);
  const f = { ...campusFilter(campus), ...filters };
  return User.countDocuments(f);
};

CampusSchema.statics.countDrivers = async function countDrivers(campus) {
  return CampusSchema.statics.countUsers(campus, driverFilter());
};

CampusSchema.statics.findUsers = async function findUsers(campus, pagination, filters = {}) {
  const User = mongoose.model(USER_MODEL_NAME);
  const f = { ...campusFilter(campus), ...filters };
  if (pagination) {
    return User.find(f).skip(pagination.offset).limit(pagination.limit);
  }
  return User.find(f);
};

CampusSchema.statics.findDrivers = async function findDrivers(campus, pagination) {
  return CampusSchema.statics.findUsers(campus, pagination, driverFilter());
};

CampusSchema.statics.findUser = async function findUser(campus, id, filters = {}) {
  const f = { _id: id, ...campusFilter(campus), ...filters };
  const User = mongoose.model(USER_MODEL_NAME);
  return User.findOne(f);
};

CampusSchema.statics.findDriver = async function findDriver(campus, id) {
  return CampusSchema.statics.findUser(campus, id, driverFilter());
};

CampusSchema.statics.findDriversInDateInterval = async function findDriversInDateInterval(campus, date, pagination) {
  const TimeSlot = mongoose.model(TIME_SLOT_MODEL_NAME);
  const slots = await TimeSlot.findWithin(date.start, date.end, { campus: { _id: campus }, drivers: { $ne: null } });
  const users = await CampusSchema.statics.findDrivers(campus, pagination);

  return users.map((u) => {
    const availabilities = slots.filter((s) => s.drivers.find((d) => d._id.equals(u._id)));
    const user = u.toObject({ virtuals: true });
    user.availabilities = availabilities.map((s) => s.toObject({ virtuals: true }));
    return user;
  }).filter((u) => u.availabilities.length);
};

CampusSchema.statics.findCars = async function findCars(campus, start, end) {
  const Car = mongoose.model(CAR_MODEL_NAME);
  const TimeSlot = mongoose.model(TIME_SLOT_MODEL_NAME);
  const slots = await TimeSlot.findWithin(start, end, { campus: { _id: campus }, cars: { $ne: null } });
  const cars = (await Car.find({
    'campus._id': campus,
  }));
  return cars.map((c) => {
    const car = c.toObject({ virtuals: true });
    const unavailabilities = slots.filter((s) => s.cars.find((d) => d.id === c.id));
    car.unavailabilities = unavailabilities.map((s) => s.toObject({ virtuals: true }));
    return car;
  }).filter((u) => u.unavailabilities.length === 0);
};

CampusSchema.statics.findRidesWithStatus = async function findRidesWithStatus(driver, status = []) {
  const Ride = mongoose.model(RIDE_MODEL_NAME);
  return Ride
    .find({
      status,
      'driver._id': driver,
    })
    .sort({
      start: 1,
    });
};

CampusSchema.statics.countRides = async function countRides(campuses, start, end) {
  const Ride = mongoose.model(RIDE_MODEL_NAME);
  return Ride.countDocuments({
    $and: [
      Ride.filtersWithin(start, end),
      Ride.generateCampusFilter(campuses),
    ],
    status: { $ne: DRAFTED },
  });
};

async function commonAggregateRides(custom, campuses, start, end) {
  const Ride = mongoose.model(RIDE_MODEL_NAME);
  const match = {
    $and: [
      Ride.generateCampusFilter(campuses),
      Ride.filtersWithin(start, end),
    ],
    status: { $ne: DRAFTED },
  };

  return Ride.aggregate([
    { $match: { ...match } },
    { $sort: { start: 1 } },
    ...custom,
  ]);
}

CampusSchema.statics.aggregateRidesByArrivalPOI = commonAggregateRides.bind(CampusSchema.statics, [
  { $group: { _id: '$arrival._id', arrival: { $last: '$arrival' }, total: { $sum: 1 } } },
  { $sort: { total: -1 } },
]);

CampusSchema.statics.aggregateRidesByDeparturePOI = commonAggregateRides.bind(CampusSchema.statics, [
  { $group: { _id: '$departure._id', departure: { $last: '$departure' }, total: { $sum: 1 } } },
  { $sort: { total: -1 } },
]);

CampusSchema.statics.aggregateRidesByCategory = commonAggregateRides.bind(CampusSchema.statics, [
  { $group: { _id: '$category._id', category: { $last: '$category' }, total: { $sum: 1 } } },
  { $sort: { total: -1 } },
]);

CampusSchema.statics.aggregateRidesByStatus = commonAggregateRides.bind(CampusSchema.statics, [
  { $group: { _id: '$status', total: { $sum: 1 } } },
  { $sort: { total: -1 } },
]);

CampusSchema.statics.aggregateRidesByCarModel = commonAggregateRides.bind(CampusSchema.statics, [
  { $group: { _id: '$car.model._id', model: { $last: '$car.model' }, total: { $sum: 1 } } },
  { $sort: { total: -1 } },
]);

CampusSchema.statics.aggregateRidesByDriver = commonAggregateRides.bind(CampusSchema.statics, [
  { $group: { _id: '$driver._id', driver: { $last: '$driver' }, total: { $sum: 1 } } },
  { $sort: { total: -1 } },
]);

CampusSchema.statics.aggregateRidesByPhonePresence = commonAggregateRides.bind(CampusSchema.statics, [
  { $group: { _id: { $ne: ['$phone', null] }, total: { $sum: 1 } } },
  { $sort: { total: -1 } },
]);

async function commonAggregateRatings(custom, campuses, start, end) {
  const Rating = mongoose.model(RATING_MODEL_NAME);
  const match = {
    $and: [
      Rating.generateCampusFilter(campuses),
      Rating.filtersWithin(start, end),
    ],
  };

  return Rating.aggregate([
    { $match: { ...match } },
    { $sort: { createdAt: 1 } },
    ...custom,
  ]);
}

CampusSchema.statics.aggregateRatingsByUXGrade = commonAggregateRatings.bind(CampusSchema.statics, [
  { $group: { _id: '$uxGrade', total: { $sum: 1 } } },
  { $sort: { _id: 1 } },
  {
    $project: {
      _id: 0,
      grade: '$_id',
      total: '$total',
    },
  },
]);

CampusSchema.statics.aggregateRatingsByRecommendationGrade = commonAggregateRatings.bind(CampusSchema.statics, [
  { $group: { _id: '$recommandationGrade', total: { $sum: 1 } } },
  { $sort: { _id: 1 } },
  {
    $project: {
      _id: 0,
      grade: '$_id',
      total: '$total',
    },
  },
]);

CampusSchema.statics.aggregateRidesOverTime = async function aggregateRidesOverTime(
  campuses, start, end, { timeUnit = 'day', timeScope = 'week' },
) {
  const Ride = mongoose.model(RIDE_MODEL_NAME);
  let averageKey;
  switch (timeUnit) {
    case 'month':
      averageKey = { $month: '$start' };
      break;
    case 'day':
      averageKey = { $isoDayOfWeek: '$start' };
      break;
    case 'hour':
      averageKey = { $hour: '$start' };
      break;
    default:
      throw new Error('Unexpected time-unit');
  }
  let format;
  switch (timeScope) {
    case 'year':
      format = '%Y';
      break;
    case 'month':
      format = '%Y-%m';
      break;
    case 'week':
      format = '%Y-%V';
      break;
    case 'day':
      format = '%Y-%m-%d';
      break;
    default:
      throw new Error('Unexpected time-scope');
  }
  return Ride.aggregate([
    {
      $match: {
        $and: [
          Ride.filtersWithin(start, end),
          Ride.generateCampusFilter(campuses),
        ],
        status: { $ne: DRAFTED },
      },
    },
    { $sort: { start: 1 } },
    { $project: { start: 1 } },
    {
      $group: {
        _id: {
          stageKey: { $dateToString: { format, date: '$start' } },
          averageKey,
        },
        total: { $sum: 1 },
      },
    },
    {
      $group: {
        _id: '$_id.averageKey',
        average: { $avg: '$total' },
        minimum: { $min: '$total' },
        maximum: { $max: '$total' },
        total: { $sum: '$total' },
      },
    },
  ]);
};

export default mongoose.model(CAMPUS_MODEL_NAME, CampusSchema, CAMPUS_COLLECTION_NAME);
