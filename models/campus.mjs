import mongoose from 'mongoose';
import createdAtPlugin from './helpers/created-at';

const { Schema } = mongoose;

const CampusSchema = new Schema({
  _id: String,
  name: { type: String, required: true },
  categories: [{
    _id: { type: String, required: true, alias: 'id' },
    label: String,
  }],
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
  const users = await CampusSchema.statics.findDrivers(campus, pagination);

  return users.map((u) => {
    const availabilities = u.getAvailabilities(date.start, date.end);
    const user = u.toObject({ virtuals: true });
    user.availabilities = availabilities;
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
  return Ride.countDocuments(Ride.filtersWithin(start, end));
};

export default mongoose.model('Campus', CampusSchema, 'campuses');
