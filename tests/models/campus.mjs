import Campus from '../../models/campus';

export const generateDummyCampus = (...params) => ({
  _id: 'TEST',
  name: 'Test',
  ...params,
});

export const createDummyCampus = async (...params) => {
  const dummyCampus = generateDummyCampus(...params);
  return Campus.create(dummyCampus);
};
