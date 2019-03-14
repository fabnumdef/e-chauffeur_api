import nanoid from 'nanoid';
import CarModel from '../../models/car-model';

export const generateDummyCarModel = () => ({
  _id: nanoid(10),
  label: 'Renault Zoé',
});

export const createDummyCarModel = async (...params) => {
  const dummyCarModel = generateDummyCarModel(...params);
  return CarModel.create(dummyCarModel);
};
