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
  ip: {
    type: String,
    required: true,
  },
});

RateLimitSchema.plugin(createdAtPlugin);
RateLimitSchema.index(
  { createdAt: 1 },
  { expireAfterSeconds: config.get('rate_limit:lifespan') },
);

export default mongoose.model(MODEL_NAME, RateLimitSchema);
