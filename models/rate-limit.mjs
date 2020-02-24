import mongoose from 'mongoose';
import config from '../services/config';
import createdAtPlugin from './helpers/created-at';

const { Schema } = mongoose;
const MODEL_NAME = 'RateLimit';

const RateLimitSchema = new Schema({
  ref: {
    type: String,
    required: true,
  },
  counter: {
    type: Number,
    default: 0,
  },
  ip: {
    type: String,
    required: true,
  },
  locked: {
    type: Date,
  },
});

RateLimitSchema.plugin(createdAtPlugin);
RateLimitSchema.index(
  { locked: 1 },
  { expireAfterSeconds: config.get('rate_limit:lock_duration') },
);
RateLimitSchema.index(
  { createdAt: 1 },
  { expireAfterSeconds: config.get('rate_limit:lifespan') },
);

RateLimitSchema.methods.increment = async function increment(ref, ip) {
  if (ref === this.ref && ip === this.ip) {
    this.counter += 1;
    if (this.counter === config.get('rate_limit:attempt_number')) {
      this.locked = new Date();
    }
  }
  await this.save();
};

export default mongoose.model(MODEL_NAME, RateLimitSchema);
