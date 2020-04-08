import mongoose from 'mongoose';
import lmapKeys from 'lodash.mapkeys';
import lmapValues from 'lodash.mapvalues';

const { ValidationError } = mongoose.Error;
export default async (ctx, next) => {
  try {
    await next();
  } catch (err) {
    if (err instanceof ValidationError) {
      ctx.status = err.status || 400;
      ctx.body = {
        message: ctx.translate(
          `mongoose.errors.${err.name}`,
          // eslint-disable-next-line no-underscore-dangle
          { model: ctx.translate(`mongoose.models.${err._message.split(' ').shift()}`) },
        ),
        errors: lmapValues(lmapKeys(err.errors, (val, key) => {
          if (key.endsWith('._id')) {
            return key.slice(0, -4);
          }
          return key;
        }), ({ path, kind }) => ({
          path,
          kind,
          message: ctx.translate(`mongoose.validators.${kind}`, { field: ctx.translate(`mongoose.paths.${path}`) }),
        })),
      };
    } else {
      ctx.log.error(err.message, err);
      ctx.status = err.status || 500;
      ctx.body = {
        message: ctx.translate(err.message),
        errors: lmapValues(lmapKeys(err.errors, (val, key) => {
          if (key.endsWith('._id')) {
            return key.slice(0, -4);
          }
          return key;
        }), ({
          path, kind, message,
        }) => ({
          path,
          kind,
          message: ctx.translate(message, { field: path }),
        })),
      };
    }
  }
};
