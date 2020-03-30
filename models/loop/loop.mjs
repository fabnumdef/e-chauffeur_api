/*
* Equivalent to ride level
* */
import mongoose from 'mongoose';
import { LOOP_MODEL_NAME, LOOP_COLLECTION_NAME } from '../helpers/constants';
import { DRAFTED } from '../status';
import { CAN_ACCESS_OWN_DATA_ON_RIDE, CAN_ACCESS_PERSONAL_DATA_ON_RIDE } from '../rights';

const { Schema, model, Types } = mongoose;

const LoopSchema = new Schema({
  _id: {
    type: Types.ObjectId,
    default: () => Types.ObjectId(),
    alias: 'id',
  },
  status: { type: String, default: DRAFTED },
  statusChanges: [{
    _id: false,
    status: { type: String, required: true },
    time: Date,
  }],
  pattern: {
    _id: {
      type: Types.ObjectId,
      alias: 'id',
    },
  },
  timeSlot: {
    _id: {
      type: Types.ObjectId,
      alias: 'id',
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
    _id: { type: Schema.ObjectId, alias: 'driver.id' },
    firstname: String,
    lastname: String,
  },
  car: {
    _id: { type: String, alias: 'car.id' },
    label: String,
    model: {
      _id: String,
      label: String,
      capacity: Number,
    },
  },
  comments: [String],
}, { timestamps: true });

export default model(LOOP_MODEL_NAME, LoopSchema, LOOP_COLLECTION_NAME);
