import mongoose from 'mongoose';
import createdAtPlugin from './helpers/created-at';
import addCSVContentPlugin from './helpers/add-csv-content';
import { CATEGORY_COLLECTION_NAME, CATEGORY_MODEL_NAME } from './helpers/constants';

const { Schema } = mongoose;

const CategorySchema = new Schema({
  _id: String,
  label: { type: String, required: true },
});

CategorySchema.plugin(createdAtPlugin);
CategorySchema.plugin(addCSVContentPlugin);

export default mongoose.model(CATEGORY_MODEL_NAME, CategorySchema, CATEGORY_COLLECTION_NAME);
