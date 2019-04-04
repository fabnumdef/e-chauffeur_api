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
    _id: { type: String },
    name: String,
  },
});

PoiSchema.virtual('campus.id')
  .get(function get() {
    return this.campus._id;
  })
  .set(function set(id) {
    this.campus._id = id;
  });


PoiSchema.index({
  _id: 'text',
  label: 'text',
});

export default mongoose.model('Poi', PoiSchema);
