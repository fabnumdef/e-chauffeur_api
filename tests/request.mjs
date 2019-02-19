import request from 'supertest';
import config from '../services/config';
import MongooseService from '../services/mongoose';
import app from '../app';
import User from '../models/user';

MongooseService(`${config.get('mongodb')}-test`);

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
