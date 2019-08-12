import mongoose from 'mongoose';
import CarEvent from '../../models/car-event';

const { Types: { ObjectId } } = mongoose;

export const generateDummyCarEvent = (params) => ({
  _id: new ObjectId(),
  ...params,
});

export const createDummyCarEvent = async (params) => {
  const dummyCarEvent = generateDummyCarEvent(params);
  return CarEvent.create(dummyCarEvent);
};

export default CarEvent;
