import mongoose from 'mongoose';

const { Schema } = mongoose;

const UserEventSchema = new Schema({
  title: String,
  start: Date,
  end: Date,
  user: {
    _id: { type: String, required: true, alias: 'id' },
    name: String,
  },
});

UserEventSchema.pre('validate', async function beforeSave() {
  const User = mongoose.model('User');
  this.user = await User.findById(this.user._id).lean();
});

UserEventSchema.virtual('user.id')
  .get(function get() {
    return this.user._id;
  })
  .set(function set(id) {
    this.user._id = id;
  });

export default mongoose.model('UserEvent', UserEventSchema, 'user-events');
