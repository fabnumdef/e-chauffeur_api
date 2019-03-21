import request from 'supertest';
import config from '../services/config';
import MongooseService from '../services/mongoose';
import app from '../app';
import User from '../models/user';
import * as roles from '../models/role';

const rolesKeys = {
  ...Object.keys(roles)
    .map(r => ({ [r]: r }))
    .reduce((acc, r) => Object.assign(acc, r), {}),
};

MongooseService(`${config.get('mongodb')}-test`);

export default () => request(app.listen());

export const generateRoleJWTHeader = (role) => {
  const user = new User({
    roles: [{
      role,
    }],
  });
  const token = user.emitJWT();
  return ['Authorization', `Bearer ${token}`];
};

export const generateRegulatorJWTHeader = (...params) => generateRoleJWTHeader(rolesKeys.ROLE_REGULATOR, ...params);
export const generateSuperAdminJWTHeader = (...params) => generateRoleJWTHeader(rolesKeys.ROLE_SUPERADMIN, ...params);
