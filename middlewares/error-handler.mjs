import mongoose from 'mongoose';

const { ValidationError } = mongoose.Error;
export default async (ctx, next) => {
  try {
    await next();
  } catch (err) {
    if (err instanceof ValidationError) {
      ctx.status = err.status || 400;
      ctx.body = err.errors;
    } else {
      ctx.log(ctx.log.ERROR, err.message, err);
      ctx.status = err.status || 500;
      ctx.body = err.message;
    }
  }
};
