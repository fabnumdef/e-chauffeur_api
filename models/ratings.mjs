import mongoose from 'mongoose';
import createdAtPlugin from './helpers/created-at';

const { Schema } = mongoose;

const RatingSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  base: {
    type: String,
    required: true,
  },
  uxGrade: {
    type: Number,
    required: true,
  },
  recommandationGrade: {
    type: Number,
    required: true,
  },
  message: String,
});

RatingSchema.plugin(createdAtPlugin);

export default mongoose.model('Rating', RatingSchema, 'ratings');
