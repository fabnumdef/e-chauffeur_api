/*
* Loop pattern to define by campus
* */
import mongoose from 'mongoose';
import config from '../../services/config';
import {
  LOOP_PATTERN_MODEL_NAME,
  LOOP_PATTERN_COLLECTION_NAME,
} from '../helpers/constants';

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

export default model(LOOP_PATTERN_MODEL_NAME, LoopPatternSchema, LOOP_PATTERN_COLLECTION_NAME);
