import mongoose from 'mongoose';

const { Schema } = mongoose;

const RideSchema = new Schema({
  campus: {
    _id: { type: String, required: true },
    name: String,
  },
});

RideSchema.virtual('campus.id')
  .get(function get() {
    return this.campus._id;
  })
  .set(function set(id) {
    this.campus._id = id;
  });

export default mongoose.model('Ride', RideSchema);
