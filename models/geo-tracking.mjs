import mongoose from 'mongoose';
import Luxon from 'luxon';

const { Schema, Types: { ObjectId } } = mongoose;
// @todo: move to native way when [this issue](https://github.com/moment/luxon/issues/252) will be solved.
const { DateTime } = Luxon;

const GeoTrackingSchema = new Schema({
  start: Date,
  end: Date,
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

GeoTrackingSchema.statics.pushHourlyTrack = async function pushHourlyTrack(user, position) {
  const GeoTracking = mongoose.model('GeoTracking');
  const start = DateTime.local().startOf('hours').toJSDate();
  const end = DateTime.local().endOf('hours').toJSDate();
  return GeoTracking.pushTrack(start, end, user, position);
};

GeoTrackingSchema.statics.pushTrack = async function pushTrack(start, end, user, [lon, lat]) {
  const GeoTracking = mongoose.model('GeoTracking');
  return GeoTracking.updateOne(
    {
      start,
      end,
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
