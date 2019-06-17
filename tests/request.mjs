import request from 'supertest';
import logger, { defaultMongoDBTransport, createMongoDBTransport } from '../services/logger';
import config from '../services/config';
import MongooseService from '../services/mongoose';
import app from '../app';
import User from '../models/user';
import * as roles from '../models/role';

const DATABASE = `${config.get('mongodb')}-test`;

logger.remove(defaultMongoDBTransport);
logger.add(createMongoDBTransport(DATABASE));

const rolesKeys = {
  ...Object.keys(roles)
    .map(r => ({ [r]: r }))
    .reduce((acc, r) => Object.assign(acc, r), {}),
};

MongooseService(DATABASE);

export default () => request(app.listen());

export const generateRoleJWTHeader = (role, ...campuses) => {
  const user = new User({
    roles: [{
      role,
      campuses,
    }],
  });
  const token = user.emitJWT();
  return ['Authorization', `Bearer ${token}`];
};

export const generateAdminJWTHeader = (...params) => generateRoleJWTHeader(rolesKeys.ROLE_ADMIN, ...params);
export const generateRegulatorJWTHeader = (...params) => generateRoleJWTHeader(rolesKeys.ROLE_REGULATOR, ...params);
export const generateUserJWTHeader = (...params) => generateRoleJWTHeader(rolesKeys.ROLE_USER, ...params);
export const generateDriverJWTHeader = (...params) => generateRoleJWTHeader(rolesKeys.ROLE_DRIVER, ...params);
export const generateSuperAdminJWTHeader = (...params) => generateRoleJWTHeader(rolesKeys.ROLE_SUPERADMIN, ...params);
export const generateAnonymousJWTHeader = () => ['Authorization', null];
