import mongoose from 'mongoose';
import UserEvent from '../../models/user-event';

const { Types: { ObjectId } } = mongoose;

export const generateDummyUserEvent = (params) => ({
  _id: new ObjectId(),
  ...params,
});

export const createDummyUserEvent = async (params) => {
  const dummyUserEvent = generateDummyUserEvent(params);
  return UserEvent.create(dummyUserEvent);
};

export default UserEvent;
