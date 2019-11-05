import nanoid from 'nanoid';
import mongoose from 'mongoose';
import Rating from '../../models/rating';

const { Types: { ObjectId } } = mongoose;

export const generateDummyRating = () => ({
  _id: new ObjectId(),
  ride: {
    _id: new ObjectId(),
  },
  uxGrade: 3,
  recommandationGrade: 2,
  message: `Rating from test -- ${nanoid()}`,
});

export const createDummyRating = async (...params) => {
  const dummyRating = generateDummyRating(...params);
  return Rating.create(dummyRating);
};

export default Rating;
