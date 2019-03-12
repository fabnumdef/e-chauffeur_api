import mongoose from 'mongoose';
import nanoid from 'nanoid';
import User from '../../models/user';

const { Types: { ObjectId } } = mongoose;

export const generateDummyUser = params => ({
  _id: new ObjectId(),
  email: `${nanoid()}@localhost`,
  ...params,
});

export const createDummyUser = async (params) => {
  const dummyCampus = generateDummyUser(params);
  return User.create(dummyCampus);
};

export default User;
