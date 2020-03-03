import nanoid from 'nanoid';
import Campus from '../../models/campus';

const randomLoc = () => Math.floor(Math.random() * Math.floor(100));

export const generateDummyCampus = (...params) => ({
  _id: nanoid(),
  name: nanoid(),
  location: {
    type: 'Point',
    coordinates: [randomLoc(), randomLoc()],
  },
  ...params,
});

export const createDummyCampus = async (...params) => {
  const dummyCampus = generateDummyCampus(...params);
  return Campus.create(dummyCampus);
};

export default Campus;
