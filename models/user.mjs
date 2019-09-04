import mongoose from 'mongoose';
import omit from 'lodash.omit';
import orderBy from 'lodash.orderby';
import chunk from 'lodash.chunk';
import difference from 'lodash.difference';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import Luxon from 'luxon';
import OpeningHours from 'opening_hours';
import validator from 'validator';
import nanoid from 'nanoid/generate';
import gliphone from 'google-libphonenumber';
import config from '../services/config';
import { sendPasswordResetMail, sendRegistrationMail, sendVerificationMail } from '../services/mail';
import { sendVerificationSMS } from '../services/twilio';
import createdAtPlugin from './helpers/created-at';
import {
  CAN_ADD_ROLE_ADMIN,
  CAN_ADD_ROLE_DRIVER,
  CAN_ADD_ROLE_LOCAL_DRIVER,
  CAN_ADD_ROLE_LOCAL_REGULATOR,
  CAN_ADD_ROLE_REGULATOR,
  CAN_ADD_ROLE_SUPERADMIN,
  CAN_REVOKE_ROLE_ADMIN,
  CAN_REVOKE_ROLE_DRIVER, CAN_REVOKE_ROLE_LOCAL_DRIVER, CAN_REVOKE_ROLE_LOCAL_REGULATOR,
  CAN_REVOKE_ROLE_REGULATOR, CAN_REVOKE_ROLE_SUPERADMIN,
} from './rights';
import * as rolesImport from './role';

const { normalizeEmail } = validator;
const { PhoneNumberFormat, PhoneNumberUtil } = gliphone;
const {
  ROLE_ADMIN, ROLE_SUPERADMIN, ROLE_DRIVER, ROLE_REGULATOR,
} = {
  ...Object.keys(rolesImport)
    .map((r) => ({ [r]: r }))
    .reduce((acc, r) => Object.assign(acc, r), {}),
};

const SALT_WORK_FACTOR = 10;
const RESET_TOKEN_EXPIRATION_SECONDS = 60 * 60 * 24;
const RESET_TOKEN_ALPHABET = '123456789abcdefghjkmnpqrstuvwxyz';

const phoneUtil = PhoneNumberUtil.getInstance();
const { Schema } = mongoose;
// @todo: move to native way when [this issue](https://github.com/moment/luxon/issues/252) will be solved.
const { DateTime, Interval } = Luxon;

const UserSchema = new Schema({
  email: {
    type: String,
    required: true,
    validate: {
      validator(v) {
        return [].concat(config.get('whitelist_domains')).reduce((acc, cur) => acc || v.endsWith(cur), false);
      },
      message({ value }) {
        return `"${value}" should ends with ${config.get('whitelist_domains').join(', ')}`;
      },
    },
    index: { unique: true },
  },
  email_confirmed: {
    type: Boolean,
    default: false,
  },
  firstname: String,
  lastname: String,
  password: String,
  phone: {
    original: String,
    canonical: String,
    confirmed: {
      type: Boolean,
      default: false,
    },
  },
  roles: [{
    _id: false,
    role: { type: String, required: true },
    campuses: [{
      _id: { type: String, required: true, alias: 'id' },
      name: { type: String, required: true },
    }],
  }],
  tokens: [
    {
      _id: false,
      token: String,
      email: String,
      phone: String,
      attempts: [
        {
          _id: false,
          date: Date,
        },
      ],
      expiration: Date,
    },
  ],
});

UserSchema.plugin(createdAtPlugin);

UserSchema.pre('validate', function preValidate() {
  if (this.isModified('email')) {
    this.email = normalizeEmail(this.email);
  }
});
UserSchema.pre('save', function preSave(next) {
  if (this.isModified('phone.original')) {
    if (this.phone.original && this.phone.original.length) {
      this.phone.canonical = phoneUtil.format(phoneUtil.parse(this.phone.original, 'FR'), PhoneNumberFormat.E164);
    } else {
      this.phone.canonical = null;
    }
    this.phone.confirmed = false;
  }

  if (!this.isModified('password') || !this.password) {
    next();
  }
  this.tokens = this.activeTokens;
  bcrypt
    .hash(this.password, SALT_WORK_FACTOR)
    .then((password) => {
      this.password = password;
      next();
    })
    .catch((err) => next(err));
});

UserSchema.virtual('name')
  .get(function getName() {
    return `${this.firstname || ''} ${this.lastname || ''}`;
  })
  .set(function setName(name) {
    if (!this.firstname && !this.lastname) {
      [this.firstname, this.lastname = ''] = name.split(' ') || [name];
    }
  });

UserSchema.virtual('activeTokens')
  .get(function getName() {
    const [firsts = []] = chunk(orderBy(
      this.tokens
        .filter((t) => t.attempts.length < 3 && t.expiration > new Date()),
      ['expiration'],
      ['desc'],
    ), 10);
    return firsts;
  });

UserSchema.methods.toCleanObject = function toCleanObject(...params) {
  return omit(this.toObject ? this.toObject(...params) : this, ['password']);
};

UserSchema.methods.emitJWT = function emitJWT(isRenewable = true) {
  const u = this.toCleanObject({ versionKey: false });
  u.id = u._id;
  u.isRenewable = isRenewable;
  delete u._id;
  return jwt.sign(
    u,
    config.get('token:secret'),
    { expiresIn: parseInt(config.get('token:duration'), 10) },
  );
};

UserSchema.methods.comparePassword = function comparePassword(password) {
  if (!this.password) {
    throw new Error('No password set');
  }
  return bcrypt.compare(password, this.password);
};

UserSchema.methods.compareResetToken = async function compareResetToken(token, email) {
  const tokenRow = this.activeTokens
    .filter((t) => !!t.email)
    .find((t) => t.email === email);

  if (!tokenRow) {
    return false;
  }

  if (token.toLowerCase() !== tokenRow.token) {
    tokenRow.attempts = tokenRow.attempts || [];
    tokenRow.attempts.push({ date: new Date() });
    await this.save();
    return false;
  }

  this.email_confirmed = true;
  await this.save();

  return true;
};

UserSchema.methods.confirmPhone = async function confirmPhone(token) {
  const phone = this.phone.canonical;
  const tokenRow = this.activeTokens
    .filter((t) => !!t.phone)
    .find((t) => t.phone === phone);

  if (!tokenRow) {
    return false;
  }

  if (token.toLowerCase() !== tokenRow.token) {
    tokenRow.attempts = tokenRow.attempts || [];
    tokenRow.attempts.push({ date: new Date() });
    return false;
  }

  this.phone.confirmed = true;
  return true;
};

UserSchema.methods.confirmEmail = async function confirmEmail(token) {
  const { email } = this;
  const tokenRow = this.activeTokens
    .filter((t) => !!t.email)
    .find((t) => t.email === email);

  if (!tokenRow) {
    return false;
  }

  if (token.toLowerCase() !== tokenRow.token) {
    tokenRow.attempts = tokenRow.attempts || [];
    tokenRow.attempts.push({ date: new Date() });
    return false;
  }

  this.email_confirmed = true;
  return true;
};

UserSchema.statics.cleanObject = (o, ...params) => {
  const User = mongoose.model('User');

  const user = new User(o);
  return user.toCleanObject(...params);
};

UserSchema.methods.getCampusesAccessibles = async function getCampusesAccessibles() {
  const campuses = this.roles
    .map((r) => r.campuses)
    .reduce((a, b) => a.concat(b), []);
  const Campus = mongoose.model('Campus');
  return Campus.find({ _id: { $in: campuses.map(({ _id }) => _id) } });
};

UserSchema.methods.getAvailabilities = function isAvailable(start, end) {
  try {
    const oh = new OpeningHours(this.workingHours);
    return oh
      .getOpenIntervals(start, end)
      .map(([f, t]) => Interval.fromDateTimes(DateTime.fromJSDate(f), DateTime.fromJSDate(t)));
  } catch (e) {
    return [];
  }
};

UserSchema.methods.diffRoles = function diffRoles(roles = []) {
  const expandRoles = (...array) => array
    .reduce(
      (acc, { role, campuses = [] }) => acc
        .concat(campuses.map((campus) => ({ role, campus }))),
      [],
    )
    .map(({ role, campus }) => ({
      role, campus: !campus ? null : { id: campus.id, name: campus.name },
    }));
  const userRoles = expandRoles(...this.roles.toObject({ virtuals: true }));
  const paramRoles = expandRoles(...roles);
  return {
    revoked: difference(userRoles, paramRoles),
    added: difference(paramRoles, userRoles),
  };
};

UserSchema.methods.checkRolesRightsIter = function checkRolesRightsIter(roles) {
  const { added, revoked } = this.diffRoles(roles);
  return [
    ...added.map(({ role, campus }) => {
      switch (role) {
        case ROLE_REGULATOR:
          return [CAN_ADD_ROLE_REGULATOR, [CAN_ADD_ROLE_LOCAL_REGULATOR, campus]];
        case ROLE_DRIVER:
          return [CAN_ADD_ROLE_DRIVER, [CAN_ADD_ROLE_LOCAL_DRIVER, campus]];
        case ROLE_ADMIN:
          return [CAN_ADD_ROLE_ADMIN];
        case ROLE_SUPERADMIN:
          return [CAN_ADD_ROLE_SUPERADMIN];
        default:
          return [];
      }
    }),
    ...revoked.map(({ role, campus }) => {
      switch (role) {
        case ROLE_REGULATOR:
          return [CAN_REVOKE_ROLE_REGULATOR, [CAN_REVOKE_ROLE_LOCAL_REGULATOR, campus]];
        case ROLE_DRIVER:
          return [CAN_REVOKE_ROLE_DRIVER, [CAN_REVOKE_ROLE_LOCAL_DRIVER, campus]];
        case ROLE_ADMIN:
          return [CAN_REVOKE_ROLE_ADMIN];
        case ROLE_SUPERADMIN:
          return [CAN_REVOKE_ROLE_SUPERADMIN];
        default:
          return [];
      }
    }),
  ];
};

UserSchema.statics.findFromLatestPositions = async function findFromLatestPositions(positions) {
  return this.find({ _id: { $in: positions.map((p) => p._id) } }).lean();
};

UserSchema.methods.getResetTokenUrl = function getResetTokenUrl(token) {
  const email = encodeURIComponent(this.email);
  return `${config.get('user_website_url')}/edit-account?email=${email}&token=${token}`;
};

UserSchema.methods.sendRegistrationTokenMail = async function sendRegistrationTokenMail(token) {
  const resetTokenUrl = this.getResetTokenUrl(token);
  await sendRegistrationMail(this.email,
    { data: { token, resetTokenUrl, ...this.toObject({ virtuals: true }) } });
};

UserSchema.methods.sendResetPasswordMail = async function sendResetPasswordMail(token) {
  const resetTokenUrl = this.getResetTokenUrl(token);
  await sendPasswordResetMail(this.email,
    { data: { token, resetTokenUrl, ...this.toObject({ virtuals: true }) } });
};

UserSchema.methods.sendVerificationMail = async function sendVerifMail(token) {
  await sendVerificationMail(this.email, { data: { token, ...this.toObject({ virtuals: true }) } });
};

UserSchema.methods.sendVerificationSMS = async function sendVerifSMS(token) {
  if (!this.phone || !this.phone.canonical) {
    throw new Error('Phone undefined');
  }
  await sendVerificationSMS(this.phone.canonical, { data: { token } });
};

UserSchema.methods.generateResetToken = async function generateResetToken({ email = null, phone = null }) {
  const expiration = new Date();
  expiration.setSeconds(expiration.getSeconds() + RESET_TOKEN_EXPIRATION_SECONDS);
  const token = {
    expiration,
    email,
    phone,
    token: nanoid(RESET_TOKEN_ALPHABET, 6),
  };
  this.tokens.unshift(token);
  return token;
};

export default mongoose.model('User', UserSchema);
