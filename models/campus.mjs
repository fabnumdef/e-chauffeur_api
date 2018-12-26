import mongoose from 'mongoose';

const { Schema } = mongoose;

const CampusSchema = new Schema({
  _id: String,
  name: { type: String, required: true },
  categories: [{
    _id: { type: String, required: true, alias: 'id' },
    label: String,
  }],
});

CampusSchema.index({
  _id: 'text',
  name: 'text',
});

export default mongoose.model('Campus', CampusSchema, 'campuses');
