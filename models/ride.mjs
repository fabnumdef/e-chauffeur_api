import mongoose from 'mongoose';
import lGet from 'lodash.get';
import Luxon from 'luxon';
import nanoid from 'nanoid';
import stateMachinePlugin from '@rentspree/mongoose-state-machine';
import gliphone from 'google-libphonenumber';
import { CAN_ACCESS_OWN_DATA_ON_RIDE, CAN_ACCESS_PERSONAL_DATA_ON_RIDE } from './rights';
import stateMachine, {
  DRAFTED,
  DELIVERED,
  CANCELABLE, CREATED,
  CANCELED_STATUSES,
} from './status';
import config from '../services/config';
import { sendSMS } from '../services/twilio';
import createdAtPlugin from './helpers/created-at';
import cleanObjectPlugin from './helpers/object-cleaner';
import {
  CAMPUS_MODEL_NAME, CAR_MODEL_MODEL_NAME, CAR_MODEL_NAME, GEO_TRACKING_MODEL_NAME,
  POI_MODEL_NAME, RIDE_COLLECTION_NAME,
  RIDE_MODEL_NAME,
  USER_MODEL_NAME,
} from './helpers/constants';
import { compareTokens, getClientURL } from './helpers/custom-methods';
import APIError from '../helpers/api-error';

const DEFAULT_TIMEZONE = config.get('default_timezone');
const { DateTime, Duration } = Luxon;
const { PhoneNumberFormat, PhoneNumberUtil } = gliphone;
const { Schema, Types } = mongoose;

function isValidated(status) {
  return ![DRAFTED, CREATED].includes(status);
}

function isCancelled(status) {
  return CANCELED_STATUSES.includes(status);
}

const RideSchema = new Schema({
  token: {
    type: String,
    default: () => nanoid(12),
  },
  status: { type: String, default: DRAFTED },
  statusChanges: [{
    _id: false,
    status: { type: String, required: true },
    time: Date,
  }],
  category: {
    _id: { type: String, alias: 'category.id' },
    label: String,
  },
  start: {
    type: Date,
    required: true,
  },
  end: Date,
  owner: {
    _id: {
      type: mongoose.Types.ObjectId,
      alias: 'owner.id',
    },
    firstname: {
      type: String,
      canEmit: [CAN_ACCESS_PERSONAL_DATA_ON_RIDE, CAN_ACCESS_OWN_DATA_ON_RIDE],
    },
    lastname: {
      type: String,
      canEmit: [CAN_ACCESS_PERSONAL_DATA_ON_RIDE, CAN_ACCESS_OWN_DATA_ON_RIDE],
    },
    email: {
      type: String,
      canEmit: [CAN_ACCESS_PERSONAL_DATA_ON_RIDE, CAN_ACCESS_OWN_DATA_ON_RIDE],
    },
  },
  departure: {
    _id: { type: String, alias: 'departure.id' },
    label: String,
    address: String,
    location: {
      type: {
        type: String,
        enum: ['Point'],
      },
      coordinates: {
        type: [Number],
      },
    },
  },
  arrival: {
    _id: { type: String, alias: 'arrival.id' },
    label: String,
    address: String,
    location: {
      type: {
        type: String,
        enum: ['Point'],
      },
      coordinates: {
        type: [Number],
      },
    },
  },
  driver: {
    _id: { type: Schema.ObjectId, alias: 'driver.id' },
    firstname: String,
    lastname: String,
  },
  car: {
    _id: { type: String, alias: 'car.id' },
    label: String,
    model: {
      _id: { type: String },
      label: { type: String },
      capacity: { type: Number },
    },
  },
  campus: {
    _id: { type: String, required: true, alias: 'campus.id' },
    phone: {
      drivers: String,
      everybody: String,
    },
    timezone: {
      type: String,
      default: process.env.TZ || DEFAULT_TIMEZONE,
    },
    defaultReservationScope: Number,
    defaultRideDuration: Number,
  },
  comments: String,
  userComments: {
    type: String,
    canEmit: [CAN_ACCESS_PERSONAL_DATA_ON_RIDE, CAN_ACCESS_OWN_DATA_ON_RIDE],
  },
  passengersCount: {
    type: Number,
    default: 1,
  },
  passengersList: [{
    name: String,
  }],
  phone: String,
  luggage: {
    type: Boolean,
    default: false,
  },
});

RideSchema.plugin(createdAtPlugin);
RideSchema.plugin(cleanObjectPlugin, RIDE_MODEL_NAME);
RideSchema.plugin(stateMachinePlugin.default, { stateMachine });

RideSchema.pre('validate', async function beforeSave() {
  if (this.start >= this.end) {
    throw new APIError(400, 'End date should be higher than start date');
  }

  if (isValidated(this.status) && !isCancelled(this.status) && !this.car._id) {
    throw new APIError(400, 'Car must be provided');
  }

  if (this.departure.id && this.arrival.id) {
    if (this.departure.id === this.arrival.id) {
      throw new APIError(400, 'Departure and arrival should be different');
    }
  }

  try {
    const phoneUtil = PhoneNumberUtil.getInstance();
    this.phone = phoneUtil.format(phoneUtil.parse(this.phone, 'FR'), PhoneNumberFormat.E164);
  } catch (e) {
    // Silent error
  }

  if (typeof this.driver === 'undefined' || !this.driver._id) {
    this.driver = null;
  }

  await Promise.all([
    (async (Campus) => {
      const campusId = this.campus._id;
      this.campus = await Campus.findById(campusId);
      if (this.campus) {
        if (this.status === DRAFTED) {
          this.end = DateTime
            .fromJSDate(this.start)
            .plus(Duration.fromObject({ minutes: this.campus.defaultRideDuration || 30 }))
            .toJSDate();
        }
        const currentReservationScope = DateTime.local()
          .plus({ seconds: this.campus.defaultReservationScope })
          .toJSDate();
        if (currentReservationScope < this.start) {
          throw new APIError(403, 'Ride date should be in campus reservation scope');
        }
      } else {
        throw new APIError(404, 'Campus not found');
      }
    })(mongoose.model(CAMPUS_MODEL_NAME)),
    (async (User) => {
      const userId = this.owner._id;
      if (!userId) {
        return;
      }
      const owner = await User.findById(userId).lean();
      const phone = lGet(owner, 'phone.canonical', null);
      this.owner = owner;
      if (phone && !this.phone && lGet(owner, 'phone.confirmed', false)) {
        this.phone = phone;
      }
    })(mongoose.model(USER_MODEL_NAME)),
    (async (Car, CarModel) => {
      const carId = this.car._id;
      this.car = await Car.findById(carId).lean();
      this.car.model = await CarModel.findById(this.car.model._id).lean();
    })(mongoose.model(CAR_MODEL_NAME), mongoose.model(CAR_MODEL_MODEL_NAME)),
    (async (Poi) => {
      if (!this.departure.address && !this.arrival.address) {
        const pois = await Poi.find({ _id: { $in: [this.arrival._id, this.departure._id] } });
        this.arrival = pois.find(({ _id }) => _id === this.arrival._id);
        this.departure = pois.find(({ _id }) => _id === this.departure._id);
      }
    })(mongoose.model(POI_MODEL_NAME)),
  ]);


  if (this.car && this.status !== DRAFTED) {
    const carCapacity = this.car.model.capacity || 3;
    if (this.passengersCount > carCapacity) {
      throw new APIError(400, 'Passenger count is higher than car capacity');
    }
  }
});

RideSchema.statics.castId = (v) => {
  try {
    return new Types.ObjectId(v);
  } catch (e) {
    return new Types.ObjectId(Buffer.from(v, 'base64').toString('hex'));
  }
};

RideSchema.statics.formatFilters = function formatFilters(rawFilters, queryFilter) {
  let filter = {
    ...rawFilters,
    ...queryFilter,
    ...this.filtersWithin(queryFilter.start, queryFilter.end),
  };

  delete filter.start;
  delete filter.end;

  if (filter.current) {
    let status;
    if (filter.current === 'false') {
      status = { status: DELIVERED };
    } else {
      status = { status: { $in: CANCELABLE } };
    }

    filter = {
      ...filter,
      ...status,
    };

    delete filter.current;
  }


  if (!filter) {
    return null;
  }
  return filter;
};

RideSchema.statics.filtersWithin = function filtersWithin(rawStart, rawEnd) {
  const queryFilter = {};
  const start = new Date(rawStart);
  const end = new Date(rawEnd);
  queryFilter.$or = [
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
  return queryFilter;
};

RideSchema.statics.findWithin = function findWithin(...params) {
  return this.find(this.formatFilters(...params));
};

RideSchema.statics.countDocumentsWithin = function countDocumentsWithin(...params) {
  return this.countDocuments(this.formatFilters(...params));
};

RideSchema.statics.generateCampusFilter = function generateCampusFilter(campuses) {
  return campuses.length > 0 ? { $or: [].concat(campuses).map((campusId) => ({ 'campus._id': campusId })) } : {};
};

RideSchema.methods.findDriverPosition = async function findDriverPosition() {
  const GeoTracking = mongoose.model(GEO_TRACKING_MODEL_NAME);
  const [position = null] = await GeoTracking.aggregate([
    {
      $match: { 'driver._id': this.driver._id },
    },
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
  ]).allowDiskUse(true);
  return position;
};

RideSchema.methods.sendSMS = async function sendUserSMS(body) {
  try {
    if (this.phone) {
      return await sendSMS(this.phone, body);
    }
  } catch (e) {
    // Silent error
    // eslint-disable-next-line no-console
    console.error(e);
  }
  return null;
};

RideSchema.methods.compareTokens = compareTokens;

RideSchema.methods.getClientURL = getClientURL;

RideSchema.methods.getSatisfactionQuestionnaireURL = function getSatisfactionQuestionnaireURL() {
  return `${config.get('user_website_url')}/rating?rideId=${this.id}`;
};

export default mongoose.model(RIDE_MODEL_NAME, RideSchema, RIDE_COLLECTION_NAME);
