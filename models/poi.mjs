import mongoose from 'mongoose';

const { Schema } = mongoose;

const PoiSchema = new Schema({
  _id: String,
  label: String,
  location: {
    type: {
      type: String,
      enum: ['Point'],
    },
    coordinates: {
      type: [Number],
    },
  },
  campus: {
    type: String,
  },
});

PoiSchema.index({
  _id: 'text',
  label: 'text',
});

export default mongoose.model('Poi', PoiSchema);
