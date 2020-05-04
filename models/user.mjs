import dns from 'dns';
import util from 'util';
import mongoose from 'mongoose';
import orderBy from 'lodash.orderby';
import chunk from 'lodash.chunk';
import differenceWith from 'lodash.differencewith';
import isEqual from 'lodash.isequal';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import validator from 'validator';
import nanoid from 'nanoid/generate';
import gliphone from 'google-libphonenumber';
import Luxon from 'luxon';
import config from '../services/config';
import { sendPasswordResetMail, sendRegistrationMail, sendVerificationMail } from '../services/mail';
import { sendVerificationSMS } from '../services/twilio';
import createdAtPlugin from './helpers/created-at';
import cleanObjectPlugin from './helpers/object-cleaner';
import addCSVContentPlugin from './helpers/add-csv-content';
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
import { CAMPUS_MODEL_NAME, USER_COLLECTION_NAME, USER_MODEL_NAME } from './helpers/constants';
import TranslatableMessage from '../helpers/translatable-message';

const { ValidationError, ValidatorError } = mongoose.Error;
const { DateTime } = Luxon;
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
const PASSWORD_TEST = /.{8,}/;
export class ExpiredPasswordError extends Error {}

const resolveDNS = util.promisify(dns.resolve);
const phoneUtil = PhoneNumberUtil.getInstance();
const { Schema } = mongoose;

const UserSchema = new Schema({
  email: {
    type: String,
    // Same regex than html5 validator, close to RFC compliance but not strictly equivalent.
    match: new RegExp(
      '^[a-zA-Z0-9.!#$%&\'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}'
      + '[a-zA-Z0-9])?(?:\\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$',
    ),
    required: true,
    maxlength: 256,
    validate: {
      async validator(v) {
        if (!v) {
          return false;
        }
        if (![]
          .concat(config.get('whitelist_domains'))
          .reduce((acc, cur) => acc || v.endsWith(cur), false)) {
          return false;
        }
        const domain = v.split('@').pop();
        if (domain === 'localhost') {
          return true;
        }
        try {
          const addresses = await resolveDNS(domain, 'MX');
          return addresses && addresses.length > 0;
        } catch (e) {
          return false;
        }
      },
      message(props) {
        // We've to override the props object to hack mongoose
        // eslint-disable-next-line no-param-reassign
        props.type = 'email_whitelist_domains';
        return new TranslatableMessage(
          'mongoose.errors.EmailNotWhiteListed',
          { email: props.value, whitelistedDomains: config.get('whitelist_domains').join(', ') },
        );
      },
    },
    index: { unique: true },
  },
  email_confirmed: {
    type: Boolean,
    default: false,
  },
  firstname: {
    type: String,
  },
  lastname: String,
  password: {
    type: String,
    canEmit: false,
  },
  passwordExpiration: Date,
  phone: {
    original: String,
    canonical: String,
    confirmed: {
      type: Boolean,
      default: false,
    },
  },
  licences: [{
    type: String,
    enum: ['B', 'C', 'D'],
    default: 'B',
  }],
  gprd: {
    type: Date,
    validate: {
      validator(v) {
        return (!this.createdAt || (v >= this.createdAt)) && (v <= new Date());
      },
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
UserSchema.plugin(cleanObjectPlugin, USER_MODEL_NAME);
UserSchema.plugin(addCSVContentPlugin);

UserSchema.index({
  _id: 'text',
  firstname: 'text',
  lastname: 'text',
  email: 'text',
  'phone.canonical': 'text',
});

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

  if (this.isModified('email')) {
    this.email_confirmed = false;
  }
  this.tokens = this.activeTokens;

  if (!this.isModified('password') || !this.password) {
    next();
  }

  if (!PASSWORD_TEST.test(this.password)) {
    const validationError = new ValidationError(this);
    const path = 'password';
    validationError.addError('password', new ValidatorError({
      path,
      message: 'password_security_criteria',
      type: 'password_security_criteria',
    }));
    throw validationError;
  }

  bcrypt
    .hash(this.password, SALT_WORK_FACTOR)
    .then((password) => {
      this.password = password;
      if (!this.isModified('passwordExpiration')) {
        this.passwordExpiration = DateTime.local().plus({ months: 4 }).toJSDate();
      }
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

UserSchema.methods.emitJWT = function emitJWT(isRenewable = true) {
  if (this.passwordExpiration && this.passwordExpiration < new Date()) {
    throw new ExpiredPasswordError('Password expired');
  }
  const u = this.toCleanObject({ versionKey: false });
  u.id = u._id;
  u.isRenewable = isRenewable;
  delete u._id;
  delete u.password;
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

UserSchema.methods.getCampusesAccessibles = async function getCampusesAccessibles() {
  const campuses = this.roles
    .map((r) => r.campuses)
    .reduce((a, b) => a.concat(b), []);
  const Campus = mongoose.model(CAMPUS_MODEL_NAME);
  return Campus.find({ _id: { $in: campuses.map(({ _id }) => _id) } });
};

UserSchema.methods.diffRoles = function diffRoles(roles = []) {
  const expandRoles = (...array) => array
    .reduce(
      (acc, { role, campuses = [] }) => acc
        .concat(campuses.length > 0 ? campuses.map((campus) => ({ role, campus })) : [{ role }]),
      [],
    )
    .map(({ role, campus }) => ({
      role, campus: !campus ? null : { id: campus.id, name: campus.name },
    }));
  const userRoles = expandRoles(...this.roles.toObject({ virtuals: true }));
  const paramRoles = expandRoles(...roles);
  return {
    revoked: differenceWith(userRoles, paramRoles, isEqual),
    added: differenceWith(paramRoles, userRoles, isEqual),
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

UserSchema.statics.findInIds = async function findInIds(ids = []) {
  return this.find({ _id: { $in: ids } });
};

UserSchema.methods.getResetTokenUrl = function getResetTokenUrl(token) {
  const email = encodeURIComponent(this.email);
  return `${config.get('user_website_url')}/my-account/edit-account?email=${email}&token=${token}`;
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

UserSchema.statics.findByEmail = function findByEmail(email) {
  return this.findOne({ email: normalizeEmail(email) });
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

export default mongoose.model(USER_MODEL_NAME, UserSchema, USER_COLLECTION_NAME);
