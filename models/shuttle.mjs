/*
* Equivalent to ride level
* */
import mongoose from 'mongoose';
import nanoid from 'nanoid';
import stateMachinePlugin from '@rentspree/mongoose-state-machine';
import {
  SHUTTLE_COLLECTION_NAME, SHUTTLE_MODEL_NAME,
  GEO_TRACKING_MODEL_NAME, WEEKLY, MONTHLY,
} from './helpers/constants';
import stateMachine, { CREATED } from './status';
import cleanObjectPlugin from './helpers/object-cleaner';
import { sendSMS } from '../services/twilio';
import { compareTokens, getClientURL } from './helpers/custom-methods';
import config from '../services/config';

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
      required: true,
      alias: 'pattern.id',
    },
    stops: [{
      _id: { type: String, required: true, alias: 'id' },
      label: String,
      location: {
        type: {
          type: String,
          enum: ['Point'],
        },
        coordinates: {
          type: [Number],
        },
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
    poi: {
      _id: {
        type: String,
        alias: 'poi.id',
      },
      stopDuration: Number,
    },
    passengers: [{
      _id: {
        type: Types.ObjectId,
        // required: true,
        alias: 'id',
      },
      email: {
        type: String,
        required: true,
      },
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
ShuttleSchema.plugin(stateMachinePlugin.default, { stateMachine }); // @todo validate state machine for shuttle

// @todo add pre validation hook

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
