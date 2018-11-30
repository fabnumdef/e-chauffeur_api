import mongoose from 'mongoose';
import rights from './rights.json';

const { Schema } = mongoose;

const RoleSchema = new Schema({
  _id: String,
  inherit: [],
  rights: {
    type: String,
    required: true,
    validate: {
      validator: a => a.every(r => r.includes(rights)),
    },
  },
  campuses: {
    type: [String],
  },
});

export default mongoose.model('Role', RoleSchema);
