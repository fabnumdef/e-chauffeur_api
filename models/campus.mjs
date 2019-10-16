import mongoose from 'mongoose';
import timezoneValidator from 'timezone-validator';
import createdAtPlugin from './helpers/created-at';
import { DRAFTED } from './status';
import config from '../services/config';

const DEFAULT_TIMEZONE = config.get('default_timezone');
const { Schema } = mongoose;

const CampusSchema = new Schema({
  _id: String,
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
    validate(v) {
      return [15, 20, 30, 60].indexOf(v) > -1;
    },
    default: 30,
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
    },
    coordinates: {
      type: [Number],
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
      message({ value }) {
        return `"${value}" seems to don't be a valid timezone`;
      },
    },
  },
});

CampusSchema.plugin(createdAtPlugin);

CampusSchema.index({
  _id: 'text',
  name: 'text',
});

const filterDriver = (campus) => [
  {
    $unwind: '$roles',
  },
  {
    $match: {
      'roles.campuses._id': campus,
      'roles.role': 'ROLE_DRIVER',
    },
  },
];


CampusSchema.statics.countDrivers = async function findDrivers(campus) {
  const User = mongoose.model('User');
  const filter = filterDriver(campus);
  filter.push({
    $group: {
      _id: '$_id',
    },
  });

  const users = await User.aggregate(filter).allowDiskUse(true);
  return users.length;
};

CampusSchema.statics.findDrivers = async function findDrivers(campus, pagination) {
  const User = mongoose.model('User');
  const filter = filterDriver(campus);
  filter.push(
    {
      $group: {
        _id: '$_id',
      },
    },
  );

  if (pagination) {
    filter.push(
      {
        $skip: pagination.offset,
      },
      {
        $limit: pagination.limit,
      },
    );
  }
  const usersIds = await User.aggregate(filter).allowDiskUse(true);

  const users = await User.find({
    _id: { $in: usersIds },
  });

  return users;
};

CampusSchema.statics.findDriver = async function findDriver(campus, id) {
  const driver = (await CampusSchema.statics.findDrivers(campus)).filter((d) => d._id.toString() === id);
  return (!driver.length) ? {} : driver.shift();
};

CampusSchema.statics.findDriversInDateInterval = async function findDriversInDateInterval(campus, date, pagination) {
  const TimeSlot = mongoose.model('TimeSlot');
  const slots = await TimeSlot.findWithin(date.start, date.end, { campus: { _id: campus } });
  const users = await CampusSchema.statics.findDrivers(campus, pagination);

  return users.map((u) => {
    const availabilities = slots.filter((s) => s.drivers.find((d) => d._id.equals(u._id)));
    const user = u.toObject({ virtuals: true });
    user.availabilities = availabilities.map((s) => s.toObject({ virtuals: true }));
    return user;
  }).filter((u) => u.availabilities.length);
};

CampusSchema.statics.findCars = async function findCars(campus, start, end) {
  const Car = mongoose.model('Car');
  const CarEvent = mongoose.model('CarEvent');
  const carIds = (await Car.find({
    'campus._id': campus,
  })).map((c) => c._id);

  const cars = await Car.find({
    _id: { $in: carIds },
  });

  const events = await CarEvent.find({
    $or: [
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
    ],
    'car._id': { $in: carIds },
  });

  return cars.map((c) => {
    const e = events.filter((ev) => ev.car.id === c.id);
    const availabilities = c.getAvailabilities(start, end, e);
    const car = c.toObject({ virtuals: true });
    car.availabilities = availabilities;
    return car;
  }).filter((u) => u.availabilities.length);
};

CampusSchema.statics.findRidesWithStatus = async function findRidesWithStatus(driver, status = []) {
  const Ride = mongoose.model('Ride');
  return Ride
    .find({
      status,
      'driver._id': driver,
    })
    .sort({
      start: 1,
    });
};

CampusSchema.statics.countRides = async function countRides(campus, start, end) {
  const Ride = mongoose.model('Ride');
  return Ride.countDocuments({
    ...Ride.filtersWithin(start, end),
    'campus._id': campus,
    status: { $ne: DRAFTED },
  });
};

async function commonAggregateRides(custom, campus, start, end) {
  const Ride = mongoose.model('Ride');
  return Ride.aggregate([
    {
      $match: {
        ...Ride.filtersWithin(start, end),
        'campus._id': campus,
        status: { $ne: DRAFTED },
      },
    },
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

CampusSchema.statics.aggregateRidesOverTime = async function aggregateRidesOverTime(
  campus, start, end, { timeUnit = 'day', timeScope = 'week' },
) {
  const Ride = mongoose.model('Ride');
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
        ...Ride.filtersWithin(start, end),
        'campus._id': campus,
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

export default mongoose.model('Campus', CampusSchema, 'campuses');
