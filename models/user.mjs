import mongoose from 'mongoose';
import omit from 'lodash.omit';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import config from '../services/config';
import rights from './rights';

const SALT_WORK_FACTOR = 10;
const { Schema } = mongoose;

const UserSchema = new Schema({
  email: { type: String, required: true, index: { unique: true } },
  password: { type: String, required: true },
  roles: [{
    _id: {
      type: String,
      required: true,
      alias: 'id',
      validate: {
        validator(v) {
          return this.parent()._id !== v; // @todo: Add more resilient cycle checking
        },
      },
    },
  }],
  cached_rights: [{
    _id: false,
    rights: [String],
    campuses: [{
      _id: { type: String, required: true, alias: 'id' },
      name: { type: String, required: true },
    }],
  }],
});

UserSchema.pre('save', function preSave(next) {
  if (!this.isModified('password') || !this.password) {
    next();
  }
  bcrypt
    .hash(this.password, SALT_WORK_FACTOR)
    .then((password) => {
      this.password = password;
      next();
    })
    .catch(err => next(err));
});

UserSchema.pre('save', function beforeSave() {
  return this.updateRightsCache();
});

UserSchema.methods.toCleanObject = function toCleanObject(...params) {
  return omit(this.toObject ? this.toObject(...params) : this, ['password']);
};

UserSchema.methods.emitJWT = function emitJWT() {
  const u = this.toCleanObject({ versionKey: false });
  u.id = u._id;
  delete u._id;
  return jwt.sign(
    u,
    config.get('token:secret'),
    { expiresIn: config.get('token:duration') },
  );
};

UserSchema.methods.comparePassword = function comparePassword(password) {
  return bcrypt.compare(password, this.password);
};

UserSchema.statics.cleanObject = o => UserSchema.methods.toCleanObject.call(o);

// @todo: Defer update + batch process
UserSchema.methods.updateRightsCache = async function updateRightsCache() {
  const Role = mongoose.model('Role');

  const lookup = async (toLookUp = [], previouslyLookedUp = []) => {
    const roles = await Role.find({ _id: { $in: toLookUp } });
    const nextLoopLookUp = roles.map(role => role.inherit.map(i => i._id)).reduce((a, b) => a.concat(b), []);
    if (nextLoopLookUp.length) {
      return roles.concat(await lookup(nextLoopLookUp, previouslyLookedUp.concat(roles.map(r => r._id))));
    }
    return roles;
  };
  this.cached_rights = (await lookup(this.roles.map(i => i._id)));
  return this;
};

UserSchema.methods.getCampusesAccessibles = function getCampusesAccessibles() {
  return this.cached_rights
    .map(r => r.campuses)
    .reduce((a, b) => a.concat(b), []); // @todo: add dedup
};
export default mongoose.model('User', UserSchema);
