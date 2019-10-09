import mongoose from 'mongoose';
import lGet from 'lodash.get';
import Luxon from 'luxon';
import nanoid from 'nanoid';
import stateMachinePlugin from '@rentspree/mongoose-state-machine';
import gliphone from 'google-libphonenumber';
import stateMachine, {
  DRAFTED, CREATED, VALIDATED, VALIDATE,
} from './status';
import config from '../services/config';
import { sendSMS } from '../services/twilio';
import createdAtPlugin from './helpers/created-at';

const { DateTime, Duration } = Luxon;
const { PhoneNumberFormat, PhoneNumberUtil } = gliphone;
const { Schema, Types } = mongoose;

const RideSchema = new Schema({
  token: {
    type: String,
    default: () => nanoid(12),
  },
  status: { type: String, default: DRAFTED },
  statusChanges: [{
    _id: false,
    status: { type: String, required: true },
    time: Date,
  }],
  category: {
    _id: { type: String, alias: 'category.id' },
    label: String,
  },
  start: {
    type: Date,
    required: true,
  },
  end: Date,
  owner: {
    _id: { type: mongoose.Types.ObjectId, alias: 'owner.id' },
    firstname: String,
    lastname: String,
    email: String,
  },
  departure: {
    _id: { type: String, required: true, alias: 'departure.id' },
    label: String,
    location: {
      type: {
        type: String,
        enum: ['Point'],
      },
      coordinates: {
        type: [Number],
      },
    },
  },
  arrival: {
    _id: { type: String, required: true, alias: 'arrival.id' },
    label: String,
    location: {
      type: {
        type: String,
        enum: ['Point'],
      },
      coordinates: {
        type: [Number],
      },
    },
  },
  driver: {
    _id: { type: Schema.ObjectId, alias: 'driver.id' },
    firstname: String,
    lastname: String,
  },
  car: {
    _id: { type: String, alias: 'car.id' },
    label: String,
    model: {
      _id: { type: String },
      label: { type: String },
    },
  },
  campus: {
    _id: { type: String, required: true, alias: 'campus.id' },
    phone: {
      drivers: String,
      everybody: String,
    },
  },
  comments: String,
  userComments: String,
  passengersCount: {
    type: Number,
    default: 1,
  },
  phone: String,
  luggage: {
    type: Boolean,
    default: false,
  },
});

RideSchema.plugin(createdAtPlugin);
RideSchema.plugin(stateMachinePlugin.default, { stateMachine });

RideSchema.pre('validate', async function beforeSave() {
  try {
    const phoneUtil = PhoneNumberUtil.getInstance();
    this.phone = phoneUtil.format(phoneUtil.parse(this.phone, 'FR'), PhoneNumberFormat.E164);
  } catch (e) {
    // Silent error
  }
  if (this.status === DRAFTED) {
    this.end = DateTime.fromJSDate(this.start).plus(Duration.fromObject({ hours: 1 })).toJSDate();
  }
  if (typeof this.driver === 'undefined' || !this.driver._id) {
    this.driver = null;
  }

  await Promise.all([
    (async (Campus) => {
      const campusId = this.campus._id;
      this.campus = await Campus.findById(campusId).lean();
    })(mongoose.model('Campus')),
    (async (User) => {
      const userId = this.owner._id;
      if (!userId) {
        return;
      }
      const owner = await User.findById(userId).lean();
      const phone = lGet(owner, 'phone.canonical', null);
      this.owner = owner;
      if (phone && !this.phone && lGet(owner, 'phone.confirmed', false)) {
        this.phone = phone;
      }
    })(mongoose.model('User')),
    (async (Car) => {
      const carId = this.car._id;
      this.car = await Car.findById(carId).lean();
    })(mongoose.model('Car')),
    (async (Poi) => {
      const pois = await Poi.find({ _id: { $in: [this.arrival._id, this.departure._id] } });
      this.arrival = pois.find(({ _id }) => _id === this.arrival._id);
      this.departure = pois.find(({ _id }) => _id === this.departure._id);
    })(mongoose.model('Poi')),
  ]);
});

RideSchema.pre('save', function preSave(next) {
  // Hack SMS, to send SMS we have to pass in status mutation flow
  if (this.isNew && this.status === VALIDATED) {
    this.status = CREATED;
  }

  // Auto validation when document is created by regulator, of when it's edited by regulator.
  // @todo: Clean that when we will review ride workflow
  this.autoValidate = (this.isNew || !this.isModified('status')) && this.status === CREATED;
  next();
});

RideSchema.post('save', async function postSave() {
  if (this.autoValidate) {
    const ride = await this.model('Ride').findById(this.id);
    ride[VALIDATE]();
    const rideUpdated = await ride.save();
    this.status = rideUpdated.status;
  }
});

RideSchema.statics.castId = (v) => {
  try {
    return new Types.ObjectId(v);
  } catch (e) {
    return new Types.ObjectId(Buffer.from(v, 'base64').toString('hex'));
  }
};

RideSchema.statics.filtersWithin = function filtersWithin(start, end, f = {}) {
  const filters = f;
  filters.$or = [
    {
      start: {
        $lte: start,
      },
      end: {
        $gte: start,
        $lte: end,
      },
    },
    {
      start: {
        $gte: start,
        $lte: end,
      },
      end: {
        $gte: end,
      },
    },
    {
      start: {
        $lte: start,
      },
      end: {
        $gte: end,
      },
    },
    {
      start: {
        $gte: start,
        $lte: end,
      },
      end: {
        $gte: start,
        $lte: end,
      },
    },
  ];
  return filters;
};

RideSchema.statics.findWithin = function findWithin(start, end, filters = {}, ...rest) {
  return this.find(
    this.filtersWithin(start, end, filters),
    ...rest,
  );
};

RideSchema.statics.countDocumentsWithin = function countDocumentsWithin(start, end, filters = {}, ...rest) {
  return this.countDocuments(
    this.filtersWithin(start, end, filters),
    ...rest,
  );
};

RideSchema.methods.findDriverPosition = async function findDriverPosition() {
  const GeoTracking = mongoose.model('GeoTracking');
  const [position = null] = await GeoTracking.aggregate([
    {
      $match: { 'driver._id': this.driver._id },
    },
    { $unwind: '$positions' },
    {
      $project: {
        driver: '$driver._id',
        position: '$positions.location',
        date: '$positions._id',
      },
    },
    { $sort: { date: -1 } },
    { $limit: 1 },
  ]).allowDiskUse(true);
  return position;
};

RideSchema.methods.sendSMS = async function sendUserSMS(body) {
  try {
    if (this.phone) {
      return await sendSMS(this.phone, body);
    }
  } catch (e) {
    // Silent error
    // eslint-disable-next-line no-console
    console.error(e);
  }
  return null;
};

RideSchema.methods.compareTokens = function compareTokens(token) {
  return this.token && token && this.token === token;
};

RideSchema.methods.getRideClientURL = function getRideClientURL() {
  return `${config.get('user_website_url')}/${this.id}?token=${this.token}`;
};

RideSchema.methods.getSatisfactionQuestionnaireURL = function getSatisfactionQuestionnaireURL() {
  return `${config.get('satisfaction_questionnaire_url')}`;
};

export default mongoose.model('Ride', RideSchema);
