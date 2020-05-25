import config from '../services/config';
import RateLimit from '../models/rate-limit';

export default async (ctx, next) => {
  const { body, ip } = ctx.request;
  if (body && body.email) {
    const ref = body.email;
    const userRateLimit = await RateLimit.countDocuments({ ref, ip });
    if (userRateLimit && userRateLimit >= config.get('rate_limit:attempt_number')) {
      ctx.throw_and_log(429, `Too many request for ${ref} with ip : ${ip}`);
    }
  } else {
    ctx.throw_and_log(400);
  }

  await next();
};
