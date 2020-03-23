import mongoose from 'mongoose';
import createdAtPlugin from './helpers/created-at';
import addCSVContentPlugin from './helpers/add-csv-content';
import { PHONE_MODEL_DASHED_NAME, PHONE_MODEL_COLLECTION_NAME, PHONE_MODEL_MODEL_NAME } from './helpers/constants';

const { Schema } = mongoose;

const PhoneModelSchema = new Schema({
  _id: String,
  label: String,
});

PhoneModelSchema.plugin(createdAtPlugin);
PhoneModelSchema.plugin(addCSVContentPlugin);

PhoneModelSchema.index({
  _id: 'text',
  label: 'text',
});

PhoneModelSchema.statics.getDashedName = () => PHONE_MODEL_DASHED_NAME;

export default mongoose.model(PHONE_MODEL_MODEL_NAME, PhoneModelSchema, PHONE_MODEL_COLLECTION_NAME);
