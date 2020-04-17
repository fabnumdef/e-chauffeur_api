import mongoose from 'mongoose';
import {
  PATTERN_MODEL_NAME,
  PATTERN_COLLECTION_NAME,
} from './helpers/constants';

const { Schema, model, Types } = mongoose;

const PatternSchema = new Schema({
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
  reachDuration: Number,
  comments: String,
}, { timestamps: true });

export default model(PATTERN_MODEL_NAME, PatternSchema, PATTERN_COLLECTION_NAME);
