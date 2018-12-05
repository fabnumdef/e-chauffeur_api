import mongoose from 'mongoose';
import rights from './rights.json';

const { Schema } = mongoose;

const RoleSchema = new Schema({
  _id: String,
  inherit: [{
    _id: {
      type: String,
      required: true,
      alias: 'id',
      validate: {
        validator(v) {
          return this.parent()._id !== v; // @todo: Add more resilient cycle checking
        },
      },
    },
  }],
  rights: [{
    type: String,
    required: true,
    validate: {
      validator: a => rights.includes(a),
    },
  }],
  campuses: [{
    _id: { type: String, required: true, alias: 'id' },
    name: { type: String, required: true },
  }],
  // @todo: Add caching system
  cached: [{
    rights: [String],
    campuses: [{
      _id: { type: String, required: true, alias: 'id' },
      name: { type: String, required: true },
    }],
  }],
});

export default mongoose.model('Role', RoleSchema);
