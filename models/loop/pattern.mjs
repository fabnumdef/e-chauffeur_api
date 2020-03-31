/*
* Loop pattern to define by campus
* */
import mongoose from 'mongoose';
import config from '../../services/config';
import {
  LOOP_PATTERN_MODEL_NAME,
  LOOP_PATTERN_COLLECTION_NAME, CAMPUS_MODEL_NAME, POI_MODEL_NAME,
} from '../helpers/constants';
import HttpError from '../../helpers/http-error';

const DEFAULT_TIMEZONE = config.get('default_timezone');
const { Schema, model, Types } = mongoose;

const LoopPatternSchema = new Schema({
  _id: {
    type: Types.ObjectId,
    default: () => Types.ObjectId(),
    alias: 'id',
  },
  label: {
    type: String,
    required: true,
  },
  category: {
    _id: { type: String, alias: 'category.id' },
    label: String,
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
    defaultReservationScope: {
      type: Number,
    },
  },
  stops: [{
    _id: {
      type: Schema.ObjectId,
      default: () => Types.ObjectId(),
      alias: 'id',
    },
    poi: {
      _id: {
        type: String,
        alias: 'poi.id',
      },
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
      reachDuration: Number, // seconds
      stopDuration: Number, // seconds
    },
  }],
  comments: String,
}, { timestamps: true });

LoopPatternSchema.pre('validate', async function beforeSave() {
  const isRedundant = this.stops
    .reduce((acc, stop, i) => {
      if (acc || i === 0) {
        return acc;
      }

      const previous = this.stops.find((_, j) => j === i - 1);

      if (previous) {
        return previous.id === stop.id;
      }
      return acc;
    }, false);

  if (isRedundant) {
    throw new HttpError(422, 'Consecutive stops should be different');
  }

  await Promise.all([
    (async (Campus) => {
      const campus = await Campus.findById(this.campus.id);
      if (!campus) {
        throw new HttpError(422, 'Campus not found');
      }
      this.campus = campus;
    })(model(CAMPUS_MODEL_NAME)),
    (async (Poi) => {
      this.stops = await Promise.all(this.stops.map(async (stop) => {
        const poi = await Poi.findById(stop.poi.id);
        if (!poi) {
          throw new HttpError(422, 'Poi not found');
        }
        return poi;
      }));
    })(model(POI_MODEL_NAME)),
  ]);
});

export default model(LOOP_PATTERN_MODEL_NAME, LoopPatternSchema, LOOP_PATTERN_COLLECTION_NAME);
