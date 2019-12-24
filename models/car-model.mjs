import mongoose from 'mongoose';
import createdAtPlugin from './helpers/created-at';
import addCSVContentPlugin from './helpers/add-csv-content';

const { Schema } = mongoose;
const MODEL_NAME = 'CarModel';

const CarModelSchema = new Schema({
  _id: String,
  label: {
    type: String,
  },
});

CarModelSchema.plugin(createdAtPlugin);
CarModelSchema.plugin(addCSVContentPlugin, MODEL_NAME);


CarModelSchema.index({
  _id: 'text',
  label: 'text',
});

CarModelSchema.statics.getDashedName = () => 'car-model';

export default mongoose.model(MODEL_NAME, CarModelSchema, 'car-models');
