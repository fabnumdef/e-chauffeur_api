import mongoose from 'mongoose';
import createdAtPlugin from './helpers/created-at';

const { Schema } = mongoose;

const PhoneModelSchema = new Schema({
  _id: String,
  label: String,
});

PhoneModelSchema.plugin(createdAtPlugin);

PhoneModelSchema.index({
  _id: 'text',
  label: 'text',
});

PhoneModelSchema.statics.getDashedName = () => 'phone-model';

export default mongoose.model('PhoneModel', PhoneModelSchema, 'phone-models');
