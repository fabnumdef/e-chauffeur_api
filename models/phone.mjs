import mongoose from 'mongoose';
import createdAtPlugin from './helpers/created-at';
import addCSVContentPlugin from './helpers/add-csv-content';

const { Schema } = mongoose;
const MODEL_NAME = 'Phone';

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
PhoneSchema.plugin(addCSVContentPlugin, MODEL_NAME);

export default mongoose.model(MODEL_NAME, PhoneSchema);
