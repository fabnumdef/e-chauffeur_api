import mongoose from 'mongoose';

const { Schema } = mongoose;

const PhoneSchema = new Schema({
  _id: String,
  imei: { type: String, required: true },
  model: { type: String, required: true },
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
});


export default mongoose.model('Phone', PhoneSchema);
