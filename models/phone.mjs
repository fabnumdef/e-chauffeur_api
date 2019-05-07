import mongoose from 'mongoose';
import createdAtPlugin from './helpers/created-at';

const { Schema } = mongoose;

const PhoneSchema = new Schema({
  _id: { type: String, required: true, alias: 'id' },
  imei: { type: String, required: true },
  model: {
    _id: { type: String, required: true, alias: 'model.id' },
    label: { type: String, required: true },
  },
  phone: { type: String, required: true },
  driver: {
    _id: { type: Schema.ObjectId, alias: 'driver.id' },
    email: String,
    name: String,
    campus: {
      _id: { type: String, alias: 'driver.campus.id' },
      name: String,
    },
  },
  state: {
    type: String,
    required: false,
    enum: [
      'new',
      'very_good',
      'good',
      'bad',
      'unusable',
    ],
  },
  comments: String,
});

PhoneSchema.plugin(createdAtPlugin);

export default mongoose.model('Phone', PhoneSchema);
