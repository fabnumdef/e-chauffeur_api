import mongoose from 'mongoose';
import createdAtPlugin from './helpers/created-at';

const { Schema } = mongoose;

const schemaOptions = {
  toObject: {
    virtuals: true,
  },
};

const PhoneSchema = new Schema({
  _id: { type: String, required: true, alias: 'id' },
  imei: { type: String, required: true },
  model: {
    _id: { type: String, required: true, alias: 'model.id' },
    label: { type: String, required: true },
  },
  phone: { type: String, required: true },
  driver: {
    _id: Schema.ObjectId,
    email: String,
    name: String,
    campus: {
      _id: String,
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
}, schemaOptions);

PhoneSchema.virtual('labelModel')
  .get(function get() {
    return this.model.label;
  });

PhoneSchema.plugin(createdAtPlugin);

export default mongoose.model('Phone', PhoneSchema);
