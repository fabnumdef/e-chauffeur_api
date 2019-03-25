import mongoose from 'mongoose';

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
  information: String,
});

CampusSchema.index({
  _id: 'text',
  name: 'text',
});

CampusSchema.statics.findDrivers = async function findDrivers(campus, start, end) {
  const User = mongoose.model('User');
  const UserEvent = mongoose.model('UserEvent');
  const userIds = (await User.aggregate([
    {
      $unwind: '$roles',
    },
    {
      $match: {
        // 'roles.rights': 'login', @todo: Add match on role that match with
        'roles.campuses._id': campus,
      },
    },
    {
      $group: {
        _id: '$_id',
      },
    },
  ])).map(u => u._id);

  const users = await User.find({
    _id: { $in: userIds },
  });

  const events = await UserEvent.find({
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
    'user._id': { $in: userIds },
  });

  return users.map((u) => {
    const e = events.filter(ev => ev.user.id === u.id);
    const availabilities = u.getAvailabilities(start, end, e);
    const user = u.toObject({ virtuals: true });
    user.availabilities = availabilities;
    return user;
  }).filter(u => u.availabilities.length);
};

CampusSchema.statics.findCars = async function findCars(campus, start, end) {
  const Car = mongoose.model('Car');
  const CarEvent = mongoose.model('CarEvent');
  const carIds = (await Car.find({
    'campus._id': campus,
  })).map(c => c._id);

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
    const e = events.filter(ev => ev.car.id === c.id);
    const availabilities = c.getAvailabilities(start, end, e);
    const car = c.toObject({ virtuals: true });
    car.availabilities = availabilities;
    return car;
  }).filter(u => u.availabilities.length);
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
