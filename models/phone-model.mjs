import mongoose from 'mongoose';
import createdAtPlugin from './helpers/created-at';
import addCSVContentPlugin from './helpers/add-csv-content';

const { Schema } = mongoose;
const MODEL_NAME = 'PhoneModel';

const PhoneModelSchema = new Schema({
  _id: String,
  label: String,
});

PhoneModelSchema.plugin(createdAtPlugin);
PhoneModelSchema.plugin(addCSVContentPlugin, MODEL_NAME);

PhoneModelSchema.index({
  _id: 'text',
  label: 'text',
});

PhoneModelSchema.statics.getDashedName = () => 'phone-model';

export default mongoose.model(MODEL_NAME, PhoneModelSchema, 'phone-models');
