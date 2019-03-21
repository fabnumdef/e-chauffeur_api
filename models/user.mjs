import mongoose from 'mongoose';
import omit from 'lodash.omit';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import Luxon from 'luxon';
import OpeningHours from 'opening_hours';
import config from '../services/config';

const SALT_WORK_FACTOR = 10;
const { Schema } = mongoose;
// @todo: move to native way when [this issue](https://github.com/moment/luxon/issues/252) will be solved.
const { DateTime, Interval } = Luxon;

const UserSchema = new Schema({
  email: { type: String, required: true, index: { unique: true } },
  name: String,
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
  cachedRights: [{
    _id: false,
    rights: [String],
    campuses: [{
      _id: { type: String, required: true },
      name: { type: String, required: true },
    }],
  }],
  workingHours: {
    type: String,
    default: '',
    validate: {
      validator(v) {
        if (!v || v.length === 0) {
          return true;
        }
        try {
          return !!(new OpeningHours(v));
        } catch (e) {
          return false;
        }
      },
    },
  },
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
    { expiresIn: parseInt(config.get('token:duration'), 10) },
  );
};

UserSchema.methods.comparePassword = function comparePassword(password) {
  return bcrypt.compare(password, this.password);
};

UserSchema.statics.cleanObject = o => UserSchema.methods.toCleanObject.call(o);

UserSchema.methods.getCampusesAccessibles = async function getCampusesAccessibles() {
  const campuses = this.roles
    .map(r => r.campuses)
    .reduce((a, b) => a.concat(b), []);
  const Campus = mongoose.model('Campus');
  return Campus.find({ _id: { $in: campuses.map(({ _id }) => _id) } });
};

UserSchema.methods.getAvailabilities = function isAvailable(start, end, events) {
  const eventsIntervals = Interval.merge(events.map(e => e.toInterval()));
  try {
    const oh = new OpeningHours(this.workingHours);
    const ohIntervals = oh
      .getOpenIntervals(start, end)
      .map(([f, t]) => Interval.fromDateTimes(DateTime.fromJSDate(f), DateTime.fromJSDate(t)));
    const intervals = [];
    ohIntervals.forEach((i) => {
      const diff = i.difference(...eventsIntervals);
      if (diff) {
        intervals.push(...diff);
      }
    });
    return intervals;
  } catch (e) {
    return [];
  }
};

export default mongoose.model('User', UserSchema);
