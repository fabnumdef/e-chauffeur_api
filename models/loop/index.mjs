/*
* Equivalent to ride level
* */
import mongoose from 'mongoose';
import nanoid from 'nanoid';
import stateMachinePlugin from '@rentspree/mongoose-state-machine';
import gliphone from 'google-libphonenumber';
import {
  LOOP_MODEL_NAME,
  LOOP_COLLECTION_NAME,
  LOOP_PATTERN_MODEL_NAME,
  LOOP_TIME_SLOTS_MODEL_NAME,
  USER_MODEL_NAME,
  POI_MODEL_NAME,
  CAR_MODEL_NAME,
  CAR_MODEL_MODEL_NAME,
  GEO_TRACKING_MODEL_NAME,
} from '../helpers/constants';
import stateMachine, { CREATED } from '../status';
import { CAN_ACCESS_OWN_DATA_ON_RIDE, CAN_ACCESS_PERSONAL_DATA_ON_RIDE } from '../rights';
import cleanObjectPlugin from '../helpers/object-cleaner';
import HttpError from '../../helpers/http-error';
import { sendSMS } from '../../services/twilio';
import { compareTokens, getClientURL } from '../helpers/custom-methods';
import config from '../../services/config';

const { PhoneNumberFormat, PhoneNumberUtil } = gliphone;
const { Schema, model, Types } = mongoose;

const LoopSchema = new Schema({
  _id: {
    type: Types.ObjectId,
    default: () => Types.ObjectId(),
    alias: 'id',
  },
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
  pattern: {
    _id: {
      type: Types.ObjectId,
      required: true,
      alias: 'pattern.id',
    },
  },
  timeSlot: {
    _id: {
      type: Types.ObjectId,
      required: true,
      alias: 'timeSlot.id',
    },
  },
  passengers: [{
    firstname: {
      type: String,
      canEmit: [CAN_ACCESS_PERSONAL_DATA_ON_RIDE, CAN_ACCESS_OWN_DATA_ON_RIDE],
    },
    lastname: {
      type: String,
      canEmit: [CAN_ACCESS_PERSONAL_DATA_ON_RIDE, CAN_ACCESS_OWN_DATA_ON_RIDE],
    },
    email: {
      type: String,
      required: true,
      canEmit: [CAN_ACCESS_PERSONAL_DATA_ON_RIDE, CAN_ACCESS_OWN_DATA_ON_RIDE],
    },
    phone: String,
    confirmed: { type: Boolean, default: false },
    /*
    * Not sure about filling with overloaded data like locations and dates
    * It is already possible to make ref to pattern for pois
    * And time-slot for date
    * */
    departure: {
      _id: { type: String, required: true, alias: 'departure.id' },
      label: String,
    },
    arrival: {
      _id: { type: String, required: true, alias: 'departure.id' },
      label: String,
    },
    luggage: { type: Boolean, default: false },
  }],
  driver: {
    _id: {
      type: Schema.ObjectId,
      required: true,
      alias: 'driver.id',
    },
    firstname: String,
    lastname: String,
  },
  car: {
    _id: {
      type: String,
      required: true,
      alias: 'car.id',
    },
    label: String,
    model: {
      _id: String,
      label: String,
      capacity: Number,
    },
  },
  comments: [String],
}, { timestamps: true });

LoopSchema.plugin(cleanObjectPlugin, LOOP_MODEL_NAME);
LoopSchema.plugin(stateMachinePlugin.default, { stateMachine }); // @todo validate state machine for loop

/*
* Static methods missing compared to Ride model :
*   - castId : is it compulsory with prefetchEdit ?
*   - formatFilters : probably in a second step
*   - generateCampusFilter : third step for stats
* */

LoopSchema.pre('validate', async function beforeSave() {
  if (this.start >= this.end) {
    throw new HttpError(422, 'End date should be higher than start date');
  }

  if (!this.car || (this.car && !this.car.model)) {
    throw new HttpError(422, 'Car must be provided with its model');
  }

  if (!this.driver) {
    throw new HttpError(422, 'Driver must be provided');
  }

  if (!this.pattern || !this.timeSlot) {
    throw new HttpError(422, 'References should be provided');
  }

  this.passengers.forEach((passenger) => {
    if (!passenger.departure || !passenger.arrival) {
      throw new HttpError(422, 'Departure and arrival should be provided for each passenger');
    }

    try {
      const phoneUtil = PhoneNumberUtil.getInstance();
      this.phone = phoneUtil.format(phoneUtil.parse(this.phone, 'FR'), PhoneNumberFormat.E164);
    } catch (e) {
      // Silent error
      // eslint-disable-next-line no-console
      console.error('\x1b[31m', e);
    }
  });

  await Promise.all([
    (async (LoopPattern) => {
      const loopPattern = await LoopPattern.findById(this.pattern.id);

      if (!loopPattern) {
        throw new HttpError(404, 'Loop pattern not found');
      }
    })(model(LOOP_PATTERN_MODEL_NAME)),

    (async (LoopTimeSlot) => {
      const loopTimeSlot = await LoopTimeSlot.findById(this.timeSlot.id);

      if (!loopTimeSlot) {
        throw new HttpError(404, 'Loop time slot not found');
      }
    })(model(LOOP_TIME_SLOTS_MODEL_NAME)),

    (async (User) => {
      this.passengers = await Promise.all(this.passengers.map(async (p) => {
        const passenger = await User.findOne(p.email);
        if (!passenger) {
          throw new HttpError(404, 'Passenger not found');
        }
        return { ...p, ...passenger };
      }));

      const driver = await User.findById(this.driver.id);
      if (!driver) {
        throw new HttpError(404, 'Driver not found');
      }
      this.driver = driver;
    })(model(USER_MODEL_NAME)),

    (async (Poi) => {
      this.passengers = await Promise.all(this.passengers.map(async (p) => {
        const pois = await Poi.find({
          _id: { $in: [p.arrival._id, p.departure._id] },
        });
        if (pois.length !== 2) {
          throw new HttpError(404, 'Passenger stops not found');
        }
        const arrival = pois.find(({ _id }) => _id === this.arrival._id);
        const departure = pois.find(({ _id }) => _id === this.departure._id);

        return { ...p, departure, arrival };
      }));
    })(model(POI_MODEL_NAME)),

    (async (Car) => {
      const car = await Car.findById(this.car.id);

      if (!car) {
        throw new HttpError(404, 'Car not found');
      }

      if (!car.model && this.car.model) {
        const carModel = await model(CAR_MODEL_MODEL_NAME).findById(this.car.model.id);
        if (!carModel) {
          throw new HttpError(404, 'Car model not found');
        }
        if (!carModel.capacity) {
          carModel.capacity = 9; // @todo set default value for CT capacity
        }
        car.model = carModel;
      }

      this.car = car;
    })(model(CAR_MODEL_NAME)),
  ]);
});

LoopSchema.statics.castId = (v) => {
  try {
    return new Types.ObjectId(v);
  } catch (e) {
    return new Types.ObjectId(Buffer.from(v, 'base64').toString('hex'));
  }
};

LoopSchema.statics.withinFilter = function withinFilter(rawStart, rawEnd) {
  const start = new Date(rawStart);
  const end = new Date(rawEnd);
  return {
    $or: [
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
    ],
  };
};

LoopSchema.statics.findWithin = function findWithin(...params) {
  return this.find(this.withinFilter(...params));
};

LoopSchema.statics.countDocumentsWithin = function countDocumentsWithin(...params) {
  return this.countDocuments(this.withinFilter(...params));
};

LoopSchema.methods.findDriverPosition = async function findDriverPosition() {
  const GeoTracking = mongoose.model(GEO_TRACKING_MODEL_NAME);
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

LoopSchema.methods.sendSMS = async function sendUserSMS(body) {
  await Promise.all(this.passengers.map(async ({ phone }) => {
    try {
      if (phone) {
        return await sendSMS(phone, body);
      }
    } catch (e) {
      // Silent error
      // eslint-disable-next-line no-console
      console.error('\x1b[31m', e);
    }
    return null;
  }));
};

LoopSchema.methods.compareTokens = compareTokens;
LoopSchema.methods.getClientURL = getClientURL;

// @todo refacto this function for loop and ride
LoopSchema.methods.getSatisfactionQuestionnaireURL = function getSatisfactionQuestionnaireURL() {
  return `${config.get('user_website_url')}/rating?loopId=${this.id}`;
};

export default model(LOOP_MODEL_NAME, LoopSchema, LOOP_COLLECTION_NAME);
