import mongoose from 'mongoose';

const { Schema } = mongoose;

const CampusSchema = new Schema({
  _id: String,
  name: { type: String, required: true },
});

CampusSchema.index({
  _id: 'text',
  name: 'text',
});

export default mongoose.model('Campus', CampusSchema);
