import nanoid from 'nanoid';
import Poi from '../../models/poi';

export const generateDummyPoi = () => ({
  _id: nanoid(),
  label: 'Test',
});

export const createDummyPoi = async (...params) => {
  const dummyPoi = generateDummyPoi(...params);
  return Poi.create(dummyPoi);
};
