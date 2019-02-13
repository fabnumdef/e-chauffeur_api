import request from 'supertest';
import '../services';
import app from '../app';
import User from '../models/user';

export default () => request(app.listen());

export const generateUserJWTHeader = (rights) => {
  const user = new User({
    cachedRights: [{
      rights,
    }],
  });
  const token = user.emitJWT();
  return ['Authorization', `Bearer ${token}`];
};
