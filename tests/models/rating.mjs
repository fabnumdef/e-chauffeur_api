import nanoid from 'nanoid';
import mongoose from 'mongoose';
import Rating from '../../models/rating';
import Ride from '../../models/ride';

const { Types: { ObjectId } } = mongoose;

export const generateDummyRating = async () => {
  const [ride] = await Ride.find();
  const rideId = ride._id.toString();
  return {
    _id: new ObjectId(),
    ride: {
      _id: rideId,
    },
    uxGrade: 0,
    recommandationGrade: 1,
    message: `Rating from test -- ${nanoid()}`,
  };
};

export default Rating;
