import mongoose from 'mongoose';
import nanoid from 'nanoid';
import {
  SHUTTLE_COLLECTION_NAME, SHUTTLE_MODEL_NAME,
  GEO_TRACKING_MODEL_NAME, WEEKLY, MONTHLY,
} from './helpers/constants';
import { CREATED } from './status';
import cleanObjectPlugin from './helpers/object-cleaner';
import config from '../services/config';
import HttpError from '../helpers/http-error';
import User from './user';
import Pattern from './pattern';
import Campus from './campus';
import Car from './car';
import { compareTokens, getClientURL } from './helpers/custom-methods';
import { sendSMS } from '../services/twilio';

const { Schema, model, Types } = mongoose;

const ShuttleSchema = new Schema({
  _id: {
    type: Types.ObjectId,
    default: () => Types.ObjectId(),
    alias: 'id',
  },
  label: {
    type: String,
    required: true,
  },
  token: {
    type: String,
    default: () => nanoid(12),
  },
  status: { type: String, default: CREATED },
  // @todo set stateMachine
  statusChanges: [{
    _id: false,
    status: { type: String, required: true },
    time: Date,
  }],
  start: {
    type: Date,
    required: true,
  },
  end: Date,
  campus: {
    _id: {
      type: String,
      required: true,
      alias: 'campus.id',
    },
  },
  pattern: {
    _id: {
      type: Types.ObjectId,
      alias: 'pattern.id',
    },
    label: {
      type: String,
    },
    stops: [{
      _id: { type: String, required: true, alias: 'id' },
      label: String,
      location: {
        type: {
          type: String,
          enum: ['Point'],
        },
        coordinates: [Number],
      },
    }],
  },
  comments: String,
  stops: [{
    _id: {
      type: String,
      required: true,
      alias: 'id',
    },
    label: {
      type: String,
      required: true,
    },
    passengers: [{
      _id: {
        type: Types.ObjectId,
        alias: 'id',
      },
      email: {
        type: String,
        required: true,
      },
      firstname: String,
      lastname: String,
      phone: String,
    }],
  }],
  driver: {
    _id: {
      type: Schema.ObjectId,
      alias: 'driver.id',
    },
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
  recurrence: {
    enabled: Boolean,
    withData: Boolean,
    frequency: {
      type: String,
      enum: [null, WEEKLY, MONTHLY],
    },
    nextHop: {
      _id: { type: Types.ObjectId, alias: 'recurrence.nextHop.id' },
      start: Date,
      end: Date,
      createdAt: Date,
    },
    previousHop: {
      _id: { type: Types.ObjectId, alias: 'recurrence.previousHop.id' },
      start: Date,
      end: Date,
      createdAt: Date,
    },
  },
}, { timestamps: true });

ShuttleSchema.plugin(cleanObjectPlugin, SHUTTLE_MODEL_NAME);

ShuttleSchema.pre('validate', async function beforeSave() {
  if (this.end && this.start >= this.end) {
    throw new HttpError(400, 'End date should be after start date');
  }

  const campus = await Campus.findById(this.campus.id);
  if (!campus) {
    throw new HttpError(404, 'Campus not found');
  }

  if (this.pattern && this.pattern.id) {
    const pattern = await Pattern.findById(this.pattern.id);
    if (!pattern) {
      throw new HttpError(404, 'Pattern not found');
    }
    this.pattern = {
      id: pattern.id,
      label: pattern.label,
      stops: [...pattern.stops],
    };
  }

  if (this.stops && this.stops.length > 0) {
    if (!this.pattern) {
      throw new HttpError(400, 'Stops are based on pattern');
    }

    this.stops = await Promise.all(this.stops.map(async (stop, index) => {
      if (!stop.id || !stop.label) {
        throw new HttpError(400, 'Stop must provide id and label');
      }
      if (stop.id !== this.pattern.stops[index].id || stop.label !== this.pattern.stops[index].label) {
        throw new HttpError(404, 'Id or label not found');
      }

      const validatedStop = {
        id: stop.id,
        label: stop.label,
      };
      if (stop.passengers && stop.passengers.length > 0) {
        if (!this.car || !this.car.model || !this.car.model.capacity) {
          throw new HttpError(400, 'Car capacity must be provided');
        }
        if (stop.passengers.length > this.car.model.capacity) {
          throw new HttpError(400, 'Passengers number higher than car capacity');
        }
        validatedStop.passengers = await Promise.all(stop.passengers.map(async (p) => {
          const passenger = await User.findOne({ email: p.email });
          if (passenger) {
            return {
              id: passenger.id,
              email: passenger.email,
              firstname: passenger.firstname,
              lastname: passenger.lastname,
              phone: passenger.phone || p.phone,
            };
          }
          return {
            email: p.email,
            phone: p.phone,
          };
        }));
      }
      return validatedStop;
    }));
  }

  if (this.driver && this.driver.id) {
    const driver = await User.findById(this.driver.id);
    if (!driver) {
      throw new HttpError(404, 'Driver not found');
    }
    if (!driver.heavyLicence) {
      throw new HttpError(400, 'Wrong licence');
    }

    this.driver = {
      id: driver.id,
      firstname: driver.firstname,
      lastname: driver.lastname,
    };
  }

  if (this.car && this.car.id) {
    const car = await Car.findById(this.car.id);
    if (!car) {
      throw new HttpError(404, 'Car not found');
    }

    this.car = {
      id: car.id,
      label: car.label,
      model: { ...car.model },
    };
  }
});

ShuttleSchema.statics.castId = (v) => {
  try {
    return new Types.ObjectId(v);
  } catch (e) {
    return new Types.ObjectId(Buffer.from(v, 'base64').toString('hex'));
  }
};

ShuttleSchema.statics.generateFilters = function generateFilters(rawFilters, queryFilter, ...rest) {
  const filter = {
    ...rawFilters,
    ...queryFilter,
    ...this.withinFilter(queryFilter.start, queryFilter.end),
    ...rest,
  };
  delete filter.start;
  delete filter.end;

  return filter;
};

ShuttleSchema.statics.withinFilter = function withinFilter(rawStart, rawEnd) {
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

ShuttleSchema.statics.findWithin = function findWithin(...params) {
  return this.find(this.generateFilters(...params));
};

ShuttleSchema.statics.countDocumentsWithin = function countDocumentsWithin(...params) {
  return this.countDocuments(this.generateFilters(...params));
};

ShuttleSchema.methods.findDriverPosition = async function findDriverPosition() {
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

ShuttleSchema.methods.sendSMS = async function sendUserSMS(body) {
  await Promise.all(this.passengers.map(async ({ phone }) => {
    try {
      if (phone) {
        return await sendSMS(phone, body);
      }
    } catch (e) {
      // Silent error
      // eslint-disable-next-line no-console
      console.error('\x1b[31m', e);
    }
    return null;
  }));
};

ShuttleSchema.methods.compareTokens = compareTokens;
ShuttleSchema.methods.getClientURL = getClientURL;

// @todo refacto this function for shuttle and ride
ShuttleSchema.methods.getSatisfactionQuestionnaireURL = function getSatisfactionQuestionnaireURL() {
  return `${config.get('user_website_url')}/rating?shuttleId=${this.id}`;
};

export default model(SHUTTLE_MODEL_NAME, ShuttleSchema, SHUTTLE_COLLECTION_NAME);
