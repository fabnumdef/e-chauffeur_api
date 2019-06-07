import nanoid from 'nanoid';
import PhoneModel from '../../models/phone-model';

export const generateDummyPhoneModel = () => ({
  _id: nanoid(10),
  label: 'Samsung J6',
});

export const createDummyPhoneModel = async (...params) => {
  const dummyPhoneModel = generateDummyPhoneModel(...params);
  return PhoneModel.create(dummyPhoneModel);
};

export default PhoneModel;
