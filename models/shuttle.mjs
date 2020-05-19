import mongoose from 'mongoose';
import pino from 'pino';
import {
  SHUTTLE_COLLECTION_NAME, SHUTTLE_MODEL_NAME, WEEKLY, MONTHLY,
} from './helpers/constants';
import { CREATED } from './status';
import cleanObjectPlugin from './helpers/object-cleaner';
import config from '../services/config';
import APIError from '../helpers/api-error';
import User from './user';
import ShuttleFactory from './shuttle-factory';
import Campus from './campus';
import Car from './car';
import { compareTokens, getClientURL } from './helpers/custom-methods';
import { sendSMS } from '../services/twilio';

const { Schema, model, Types } = mongoose;

const log = pino();

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
  shuttleFactory: {
    _id: {
      type: Types.ObjectId,
      alias: 'shuttleFactory.id',
    },
    label: {
      type: String,
    },
    stops: [{
      _id: { type: String, required: true, alias: 'id' },
      label: { type: String, required: true },
      time: { type: Date, required: true },
      reachDuration: { type: Number, required: true },
      location: {
        type: {
          type: String,
          enum: ['Point'],
        },
        coordinates: [Number],
      },
    }],
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
    departure: {
      _id: {
        type: String,
        required: true,
        alias: 'departure.id',
      },
      label: {
        type: String,
      },
    },
    arrival: {
      _id: {
        type: String,
        required: true,
        alias: 'arrival.id',
      },
      label: {
        type: String,
      },
    },
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
  comments: String,
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
  this.end = this.shuttleFactory.stops[this.shuttleFactory.stops.length - 1].time;

  const campus = await Campus.findById(this.campus._id);
  if (!campus) {
    throw new APIError(404, 'Campus not found');
  }

  const shuttleFactory = await ShuttleFactory.findById(this.shuttleFactory._id).lean();
  if (!shuttleFactory) {
    throw new APIError(404, 'Pattern not found');
  }

  this.shuttleFactory.stops = await Promise.all(this.shuttleFactory.stops.map(async (stop, index) => {
    if (stop._id !== shuttleFactory.stops[index]._id || stop.label !== shuttleFactory.stops[index].label) {
      throw new APIError(404, 'Id or label not found');
    }

    const validatedStop = {
      _id: stop._id,
      label: stop.label,
      time: stop.time,
      location: stop.location,
      reachDuration: shuttleFactory.stops[index].reachDuration,
    };

    if (stop.passengers && stop.passengers.length > 0) {
      if (!this.car || !this.car.model || !this.car.model.capacity) {
        throw new APIError(400, 'Car capacity must be provided');
      }
      if (stop.passengers.length > this.car.model.capacity) {
        throw new APIError(400, 'Passengers number higher than car capacity');
      }
      validatedStop.passengers = await Promise.all(stop.passengers.map(async (p) => {
        const passenger = await User.findOne({ email: p.email });
        if (passenger) {
          return {
            ...passenger,
            phone: passenger.phone || p.phone,
          };
        }
        return p;
      }));
    }
    return validatedStop;
  }));

  if (this.driver && this.driver._id) {
    const driver = await User.findById(this.driver._id);
    if (!driver) {
      throw new APIError(404, 'Driver not found');
    }
    if (!driver.licences.includes('D')) {
      throw new APIError(400, 'Wrong licence');
    }

    this.driver = driver;
  }

  if (this.car && this.car._id) {
    const car = await Car.findById(this.car._id);
    if (!car) {
      throw new APIError(404, 'Car not found');
    }

    this.car = car;
  }
});

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

ShuttleSchema.methods.sendSMS = async function sendUserSMS(body) {
  await Promise.all(this.passengers.map(async ({ phone }) => {
    try {
      if (phone) {
        return await sendSMS(phone, body);
      }
    } catch (e) {
      // Silent error
      log.error(e);
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
