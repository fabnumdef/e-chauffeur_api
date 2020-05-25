import mongoose from 'mongoose';
import createdAtPlugin from './helpers/created-at';
import addCSVContentPlugin from './helpers/add-csv-content';
import Ride from './ride';
import { RATING_COLLECTION_NAME, RATING_MODEL_NAME } from './helpers/constants';
import APIError from '../helpers/api-error';

const { Schema } = mongoose;

const RatingSchema = new Schema({
  ride: {
    _id: {
      type: Schema.Types.ObjectId,
      alias: 'ride.id',
      required: true,
      index: {
        unique: true,
        sparse: true,
      },
    },
    campus: {
      _id: {
        type: String,
        alias: 'ride.campus.id',
        required: true,
      },
    },
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
RatingSchema.plugin(addCSVContentPlugin);

RatingSchema.pre('validate', async function preValidate(next) {
  const ride = await Ride.findById(this.ride._id).lean();
  if (!ride) {
    throw new APIError(404, 'Ride does not exist in database');
  }

  this.ride.campus._id = ride.campus._id;
  next();
});

RatingSchema.statics.filtersWithin = function filtersWithin(start, end, f = {}) {
  const filters = f;
  filters.$and = [
    { createdAt: { $gte: start } },
    { createdAt: { $lte: end } },
  ];
  return filters;
};

RatingSchema.statics.generateCampusFilter = function generateCampusFilter(campuses) {
  return campuses.length > 0 ? { $or: [].concat(campuses).map((campusId) => ({ 'ride.campus._id': campusId })) } : {};
};

export default mongoose.model(RATING_MODEL_NAME, RatingSchema, RATING_COLLECTION_NAME);
