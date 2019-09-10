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
  number: { type: String, required: true },
  owner: {
    _id: { type: Schema.ObjectId, alias: 'owner.id' },
    email: String,
    firstname: String,
    lastname: String,
  },
  campus: {
    _id: { type: String, alias: 'campus.id' },
    name: String,
  },
  state: {
    type: String,
    required: false,
    enum: [
      null,
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
