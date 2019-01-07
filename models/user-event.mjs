import mongoose from 'mongoose';
import Luxon from 'luxon';

const { Schema } = mongoose;
// @todo: move to native way when [this issue](https://github.com/moment/luxon/issues/252) will be solved.
const { DateTime, Interval } = Luxon;

const UserEventSchema = new Schema({
  title: String,
  start: Date,
  end: Date,
  user: {
    _id: { type: Schema.ObjectId, required: true, alias: 'id' },
    name: String,
  },
});

UserEventSchema.pre('validate', async function beforeSave() {
  const User = mongoose.model('User');
  this.user = await User.findById(this.user._id).lean();
});

UserEventSchema.methods.toInterval = function toInterval() {
  return Interval.fromDateTimes(
    DateTime.fromJSDate(this.start),
    DateTime.fromJSDate(this.end),
  );
};

UserEventSchema.virtual('user.id')
  .get(function get() {
    return this.user._id;
  })
  .set(function set(id) {
    this.user._id = id;
  });

export default mongoose.model('UserEvent', UserEventSchema, 'user-events');
