import config from '../services/config';
import RateLimit from '../models/rate-limit';

export const incrementRateLimit = async (ref, ip) => {
  const userRateLimit = await RateLimit.findOneAndUpdate({ ref, ip }, { ref, ip }, { upsert: true });
  await userRateLimit.increment(ref, ip);
};

export const rateLimitMiddleware = async (ctx, next) => {
  if (ctx.request.body && ctx.request.body.email) {
    const ref = ctx.request.body.email;
    const userRateLimit = await RateLimit.findOne({ ref });
    if (userRateLimit && userRateLimit.counter >= config.get('rate_limit:attempt_number')) {
      ctx.throw_and_log(429);
    }
  } else {
    ctx.throw_and_log(422);
  }

  await next();
};
