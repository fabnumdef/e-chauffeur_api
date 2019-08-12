import nanoid from 'nanoid';
import Car from '../../models/car';

export const generateDummyCar = (params) => ({
  _id: nanoid(10),
  label: 'Renault Zoé',
  ...params,
});

export const createDummyCar = async (params) => {
  const dummyCar = generateDummyCar(params);
  return Car.create(dummyCar);
};

export default Car;
