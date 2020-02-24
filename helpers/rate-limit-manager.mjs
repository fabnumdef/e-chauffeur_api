import config from '../services/config';
import RateLimit from '../models/rate-limit';

export const handleRateLimit = async (ref, ip) => {
  const userRateLimit = await RateLimit.findOne({ ref });
  if (!userRateLimit) {
    await RateLimit.create({
      ref, ip,
    });
  } else {
    await userRateLimit.increment(ref, ip);
  }
};

export const rateLimitMiddleware = async (ctx, next) => {
  const userRateLimit = await RateLimit.findOne({ ref: ctx.request.body.email });
  if (userRateLimit && userRateLimit.counter >= config.get('rate_limit:attempt_number')) {
    ctx.throw_and_log(429);
  }
  await next();
};
