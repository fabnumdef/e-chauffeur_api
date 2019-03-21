import nanoid from 'nanoid';
import Category from '../../models/category';

export const generateDummyCategory = () => ({
  _id: nanoid(),
  label: 'Test',
});

export default Category;
