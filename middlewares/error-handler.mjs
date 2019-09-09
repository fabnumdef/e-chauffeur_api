import mongoose from 'mongoose';
import lmapKeys from 'lodash.mapkeys';

const { ValidationError } = mongoose.Error;
export default async (ctx, next) => {
  try {
    await next();
  } catch (err) {
    if (err instanceof ValidationError) {
      ctx.status = err.status || 400;
      ctx.body = lmapKeys(err.errors, (val, key) => {
        if (key.endsWith('._id')) {
          return key.slice(0, -4);
        }
        return key;
      });
    } else {
      ctx.log(ctx.log.ERROR, err.message, err);
      // eslint-disable-next-line no-console
      console.error(err);
      ctx.status = err.status || 500;
      ctx.body = err.message;
    }
  }
};
