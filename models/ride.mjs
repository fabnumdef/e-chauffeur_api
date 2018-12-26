import mongoose from 'mongoose';
import stateMachinePlugin from '@rentspree/mongoose-state-machine';
import stateMachine from './status';

const { Schema } = mongoose;

const RideSchema = new Schema({
  status: String,
  campus: {
    _id: { type: String, required: true },
    name: String,
  },
});

RideSchema.plugin(stateMachinePlugin, { stateMachine });

RideSchema.virtual('campus.id')
  .get(function get() {
    return this.campus._id;
  })
  .set(function set(id) {
    this.campus._id = id;
  });

export default mongoose.model('Ride', RideSchema);
