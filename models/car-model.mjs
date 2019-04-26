import mongoose from 'mongoose';
import createdAtPlugin from './helpers/created-at';

const { Schema } = mongoose;

const CarModelSchema = new Schema({
  _id: String,
  label: {
    type: String,
  },
});

CarModelSchema.plugin(createdAtPlugin);

CarModelSchema.index({
  _id: 'text',
  label: 'text',
});

CarModelSchema.statics.getDashedName = () => 'car-model';

export default mongoose.model('CarModel', CarModelSchema, 'car-models');
