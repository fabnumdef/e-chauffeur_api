import mongoose from 'mongoose';

const { Types: { ObjectId } } = mongoose;

// eslint-disable-next-line import/prefer-default-export
export const generateDummyUser = () => ({
  _id: new ObjectId(),
});
