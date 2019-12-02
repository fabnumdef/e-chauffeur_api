import mongoose from 'mongoose';
import createdAtPlugin from './helpers/created-at';
import Ride from './ride';

const { Schema } = mongoose;

const RatingSchema = new Schema({
  ride: {
    _id: {
      type: Schema.Types.ObjectId,
      alias: 'ride.id',
      required: true,
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

RatingSchema.pre('validate', async function preValidate(next) {
  const ride = await Ride.findById(this.ride._id).lean();
  if (!ride) {
    const err = new Error();
    err.status = 404;
    err.message = 'Ride does not exist in database';
    throw err;
  }
  this.ride.campus._id = ride.campus._id;
  next();
});

export default mongoose.model('Rating', RatingSchema, 'ratings');
