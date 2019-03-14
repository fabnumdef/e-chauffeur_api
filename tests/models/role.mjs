import nanoid from 'nanoid';
import Role from '../../models/role';

export const generateDummyRole = () => ({
  _id: nanoid(),
});

export default Role;
