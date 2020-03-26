import mongoose from 'mongoose';
import createdAtPlugin from './helpers/created-at';
import addCSVContentPlugin from './helpers/add-csv-content';
import {
  CAR_MODEL_COLLECTION_NAME,
  CAR_MODEL_DASHED_NAME,
  CAR_MODEL_MODEL_NAME,
} from './helpers/constants';

const { Schema } = mongoose;

const CarModelSchema = new Schema({
  _id: String,
  label: {
    type: String,
  },
  capacity: {
    type: Number,
    default: 3,
  },
});

CarModelSchema.plugin(createdAtPlugin);
CarModelSchema.plugin(addCSVContentPlugin);


CarModelSchema.index({
  _id: 'text',
  label: 'text',
});

CarModelSchema.statics.getDashedName = () => CAR_MODEL_DASHED_NAME;

export default mongoose.model(CAR_MODEL_MODEL_NAME, CarModelSchema, CAR_MODEL_COLLECTION_NAME);
