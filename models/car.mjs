import mongoose from 'mongoose';

const { Schema } = mongoose;

const CarSchema = new Schema({
  _id: String,
  label: { type: String, required: true },
  model: {
    _id: { type: String, required: true },
    label: { type: String, required: true },
  },
  campus: {
    _id: { type: String, required: true },
    name: String,
  },
});

CarSchema.virtual('campus.id')
  .get(function get() {
    return this.campus._id;
  })
  .set(function set(id) {
    this.campus._id = id;
  });

CarSchema.virtual('model.id')
  .get(function get() {
    return this.model._id;
  })
  .set(function set(id) {
    this.model._id = id;
  });

CarSchema.index({
  _id: 'text',
  label: 'text',
});

export default mongoose.model('Car', CarSchema);
