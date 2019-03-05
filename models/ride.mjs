import mongoose from 'mongoose';
import nanoid from 'nanoid';
import stateMachinePlugin from '@rentspree/mongoose-state-machine';
import stateMachine, { CREATED } from './status';
import config from '../services/config';
import { sendSMS } from '../services/twilio';
import gliphone from 'google-libphonenumber';

const { PhoneNumberFormat, PhoneNumberUtil } = gliphone;
const { Schema, Types } = mongoose;

const RideSchema = new Schema({
  token: {
    type: String,
    default: () => nanoid(12),
  },
  status: { type: String, default: CREATED },
  statusChanges: [{
    _id: false,
    status: { type: String, required: true },
    time: Date,
  }],
  category: {
    _id: { type: String, required: true, alias: 'category.id' },
    label: String,
  },
  start: Date,
  end: Date,
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
    _id: { type: Schema.ObjectId, required: true, alias: 'driver.id' },
    name: String,
  },
  car: {
    _id: { type: String, required: true, alias: 'car.id' },
    label: String,
    model: {
      _id: { type: String, required: true },
      label: { type: String, required: true },
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
  passengersCount: Number,
  phone: String,
});

RideSchema.plugin(stateMachinePlugin.default, { stateMachine });

RideSchema.pre('validate', async function beforeSave() {
  const phoneUtil = PhoneNumberUtil.getInstance()
  this.phone = phoneUtil.format(phoneUtil.parse(this.phone, 'FR'), PhoneNumberFormat.E164);

  await Promise.all([
    (async (Campus) => {
      const campusId = this.campus._id;
      this.campus = await Campus.findById(campusId).lean();
    })(mongoose.model('Campus')),
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

RideSchema.methods.isAccessibleByAnonymous = function isAccessibleByAnonymous(token) {
  return this.token === token;
};

RideSchema.methods.findDriverPosition = async function findDriverPosition() {
  const GeoTracking = mongoose.model('GeoTracking');
  const [position = null] = await GeoTracking.aggregate([
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
  ]);
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

RideSchema.methods.getRideClientURL = function getRideClientURL() {
  return `https://${config.get('user_website_url')}/${this.id}?token=${this.token}`;
};

RideSchema.methods.getSatisfactionQuestionnaireURL = function getSatisfactionQuestionnaireURL() {
  return `${config.get('satisfaction_questionnaire_url')}`;
};

export default mongoose.model('Ride', RideSchema);
