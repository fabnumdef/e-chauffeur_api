import mongoose from 'mongoose';

const { Schema } = mongoose;

const CarModelSchema = new Schema({
  _id: String,
  label: {
    type: String,
  },
});

CarModelSchema.index({
  _id: 'text',
  label: 'text',
});

CarModelSchema.statics.getDashedName = () => 'car-model';

export default mongoose.model('CarModel', CarModelSchema, 'car-models');
