import mongoose from 'mongoose';
import Luxon from 'luxon';

const { Schema, Types: { ObjectId } } = mongoose;
// @todo: move to native way when [this issue](https://github.com/moment/luxon/issues/252) will be solved.
const { DateTime } = Luxon;

const GeoTrackingSchema = new Schema({
  start: Date,
  end: Date,
  campus: {
    _id: { type: Schema.ObjectId, required: true, alias: 'campus.id' },
  },
  driver: {
    _id: { type: Schema.ObjectId, required: true, alias: 'driver.id' },
  },
  positions: [
    {
      _id: Date,
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
  ],
});

GeoTrackingSchema.statics.getLatestPosition = async function getLatestPositions(drivers = [], date) {
  const upperDate = date;
  const lowerDate = new Date((date * 1) - (1000 * 3600));
  const GeoTracking = mongoose.model('GeoTracking');
  return GeoTracking.aggregate([
    {
      $match: {
        'driver._id': { $in: drivers.map((d) => d._id) },
        $or: [
          {
            start: { $lte: upperDate, $gte: lowerDate },
          },
          {
            end: { $lte: upperDate, $gte: lowerDate },
          },
        ],
      },
    },
    {
      $unwind: '$positions',
    },
    {
      $project: {
        driverId: '$driver._id',
        position: '$positions.location',
        date: '$positions._id',
      },
    },
    { $sort: { date: -1 } },
    { $group: { _id: '$driverId', date: { $first: '$date' }, position: { $first: '$position' } } },
  ]).allowDiskUse(true);
};

GeoTrackingSchema.statics.pushHourlyTrack = async function pushHourlyTrack(user, campus, position) {
  const GeoTracking = mongoose.model('GeoTracking');
  const start = DateTime.local().startOf('hours').toJSDate();
  const end = DateTime.local().endOf('hours').toJSDate();
  return GeoTracking.pushTrack(start, end, user, campus, position);
};

GeoTrackingSchema.statics.pushTrack = async function pushTrack(start, end, user, campus, [lon, lat]) {
  const GeoTracking = mongoose.model('GeoTracking');
  return GeoTracking.updateOne(
    {
      start,
      end,
      campus: { _id: campus.id },
      driver: { _id: new ObjectId(user.id) },
    },
    {
      $push: {
        positions: {
          _id: new Date(),
          location: {
            type: 'Point',
            coordinates: [lon, lat],
          },
        },
      },
    },
    {
      upsert: true,
    },
  );
};

GeoTrackingSchema.virtual('driver.id')
  .get(function get() {
    return this.driver._id;
  })
  .set(function set(id) {
    this.driver._id = id;
  });

export default mongoose.model('GeoTracking', GeoTrackingSchema, 'geo-tracking');
