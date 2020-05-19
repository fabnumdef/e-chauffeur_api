import mongoose from 'mongoose';
import {
  SHUTTLE_FACTORY_MODEL_NAME,
  SHUTTLE_FACTORY_COLLECTION_NAME,
  SHUTTLE_FACTORY_DASHED_NAME,
} from './helpers/constants';
import Poi from './poi';
import HttpError from '../helpers/http-error';

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
    reachDuration: {
      type: Number,
      default: 0,
    },
  }],
  comments: String,
}, { timestamps: true });

ShuttleFactorySchema.pre('validate', async function validate() {
  if (this.stops.length > 0) {
    this.stops = await Promise.all(this.stops.map(async (stop, index) => {
      const isInDatabase = await Poi.findById(stop.id).lean();
      if (!isInDatabase) {
        throw new HttpError(404, 'Poi not found');
      }
      const updatedStop = isInDatabase;
      if (index === 0) {
        updatedStop.reachDuration = 0;
      } else if (stop.reachDuration === 0) {
        throw new HttpError(400, 'Reach duration should be provided');
      } else {
        updatedStop.reachDuration = stop.reachDuration;
      }
      return updatedStop;
    }));
  }
});

ShuttleFactorySchema.statics.getDashedName = () => SHUTTLE_FACTORY_DASHED_NAME;

export default model(SHUTTLE_FACTORY_MODEL_NAME, ShuttleFactorySchema, SHUTTLE_FACTORY_COLLECTION_NAME);
