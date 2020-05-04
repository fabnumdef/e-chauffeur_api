import mongoose from 'mongoose';
import {
  SHUTTLE_FACTORY_MODEL_NAME,
  SHUTTLE_FACTORY_COLLECTION_NAME,
  SHUTTLE_FACTORY_DASHED_NAME,
} from './helpers/constants';

const { Schema, model, Types } = mongoose;

const ShuttleFactorySchema = new Schema({
  _id: {
    type: Types.ObjectId,
    default: () => Types.ObjectId(),
    alias: 'id',
  },
  label: {
    type: String,
    unique: true,
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

ShuttleFactorySchema.statics.getDashedName = () => SHUTTLE_FACTORY_DASHED_NAME;

export default model(SHUTTLE_FACTORY_MODEL_NAME, ShuttleFactorySchema, SHUTTLE_FACTORY_COLLECTION_NAME);
