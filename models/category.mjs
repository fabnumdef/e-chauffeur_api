import mongoose from 'mongoose';
import createdAtPlugin from './helpers/created-at';
import addCSVContentPlugin from './helpers/add-csv-content';

const { Schema } = mongoose;
const MODEL_NAME = 'Category';

const CategorySchema = new Schema({
  _id: String,
  label: { type: String, required: true },
});

CategorySchema.plugin(createdAtPlugin);
CategorySchema.plugin(addCSVContentPlugin);

export default mongoose.model(MODEL_NAME, CategorySchema, 'categories');
