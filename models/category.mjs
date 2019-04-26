import mongoose from 'mongoose';
import createdAtPlugin from './helpers/created-at';

const { Schema } = mongoose;

const CategorySchema = new Schema({
  _id: String,
  label: { type: String, required: true },
});

CategorySchema.plugin(createdAtPlugin);

export default mongoose.model('Category', CategorySchema, 'categories');
