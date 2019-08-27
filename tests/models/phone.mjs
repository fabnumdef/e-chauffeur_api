import nanoid from 'nanoid';
import Phone from '../../models/phone';

export const generateDummyPhone = (params) => ({
  _id: nanoid(),
  imei: 'MyIMEICode',
  label: 'Test',
  number: '0000000000',
  ...params,
});

export const createDummyPhone = async (...params) => {
  const dummyPhone = generateDummyPhone(...params);
  return Phone.create(dummyPhone);
};

export default Phone;
