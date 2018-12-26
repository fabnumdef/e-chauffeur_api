import mongoose from 'mongoose';

const { Schema } = mongoose;

const CategorySchema = new Schema({
  _id: String,
  label: { type: String, required: true },
});

export default mongoose.model('Category', CategorySchema, 'categories');
