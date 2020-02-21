import mongoose from 'mongoose';
import config from '../services/config';

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
    type: Boolean,
    default: false,
  },
},
{
  timestamp: true,
});

RateLimitSchema.methods.increment = async function increment(ref, ip) {
  if (ref === this.ref && ip === this.ip) {
    this.counter += 1;
    if (this.counter >= config.get('rate_limit:attempt_number')) {
      this.lockRateLimit();
    } else {
      await this.save();
    }
  }
};

RateLimitSchema.methods.lockRateLimit = async function lock() {
  if (!this.locked) {
    this.locked = true;
    await this.save();
    setTimeout(() => {
      this.counter = 0;
      this.locked = false;
      this.save();
    }, config.get('rate_limit:lock_duration'));
  }
};

export default mongoose.model(MODEL_NAME, RateLimitSchema);
