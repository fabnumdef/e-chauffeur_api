import mongoose from 'mongoose';

const { Schema } = mongoose;

const CarSchema = new Schema({
  _id: String,
  label: { type: String, required: true },
  model: {
    type: String,
  },
  campus: {
    _id: String,
    name: String,
  },
});

CarSchema.index({
  _id: 'text',
  label: 'text',
});

export default mongoose.model('Car', CarSchema);
