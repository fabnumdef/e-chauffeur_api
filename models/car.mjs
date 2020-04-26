import mongoose from 'mongoose';
import Luxon from 'luxon';
import createdAtPlugin from './helpers/created-at';
import addCSVContentPlugin from './helpers/add-csv-content';
import { CAR_COLLECTION_NAME, CAR_MODEL_NAME } from './helpers/constants';

const { Interval } = Luxon;
const { Schema } = mongoose;

const CarSchema = new Schema({
  _id: { type: String, required: true },
  label: { type: String, required: true },
  model: {
    _id: { type: String, required: true },
    label: { type: String, required: true },
  },
  campus: {
    _id: { type: String, required: true },
    name: String,
  },
});

CarSchema.plugin(createdAtPlugin);
CarSchema.plugin(addCSVContentPlugin);

CarSchema.virtual('campus.id')
  .get(function get() {
    return this.campus._id;
  })
  .set(function set(id) {
    this.campus._id = id;
  });

CarSchema.virtual('model.id')
  .get(function get() {
    return this.model._id;
  })
  .set(function set(id) {
    this.model._id = id;
  });

CarSchema.index({
  _id: 'text',
  label: 'text',
  'campus._id': 'text',
  'campus.name': 'text',
  'model._id': 'text',
  'model.label': 'text',
});

CarSchema.methods.getAvailabilities = function isAvailable(start, end, events) {
  const interval = Interval.fromDateTimes(start, end);
  const eventsIntervals = Interval.merge(events.filter((e) => !!e.toInterval).map((e) => e.toInterval()));
  try {
    const intervals = [];
    const diff = interval.difference(...eventsIntervals);
    if (diff) {
      intervals.push(...diff);
    }
    return intervals;
  } catch (e) {
    return [];
  }
};

export default mongoose.model(CAR_MODEL_NAME, CarSchema, CAR_COLLECTION_NAME);
