import mongoose from 'mongoose';
import lmapKeys from 'lodash.mapkeys';
import lmapValues from 'lodash.mapvalues';
import APIError from '../helpers/api-error';
import TranslatableMessage from '../helpers/translatable-message';

const { ValidationError } = mongoose.Error;
function normalizeErrors(errors, transformMessage) {
  return lmapValues(lmapKeys(errors, (val, key) => {
    if (key === '_id') {
      return 'id';
    }
    if (key.endsWith('._id')) {
      return key.slice(0, -4);
    }
    return key;
  }), ({ path, kind, message }, key) => {
    const normalizedValues = {
      kind, message, path,
    };
    if (!normalizedValues.path || !normalizedValues.path.includes('.')) {
      normalizedValues.path = key;
    }
    return {
      ...normalizedValues,
      message: transformMessage(normalizedValues),
    };
  });
}
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
        errors: normalizeErrors(
          err.errors,
          ({ kind, path, message }) => ctx.translate(
            ...(
              message instanceof TranslatableMessage
                ? message.toTranslationParameters()
                : [`mongoose.validators.${kind}`,
                  { field: ctx.translate(`mongoose.paths.${path}`) }]
            )
            ,
          ),
        ),
      };
    } else if (err instanceof APIError) {
      ctx.status = err.status;
      ctx.body = {
        message: ctx.translate(err.message),
        errors: err.errors.map(({ message, ...params }) => ctx.translate(message, params)),
      };
    } else {
      ctx.log.error(err.message, err);
      ctx.status = err.status || 500;
      ctx.body = {
        message: ctx.translate(err.message),
        errors: normalizeErrors(
          err.errors,
          ({ path, message }) => ctx.translate(message, { field: path }),
        ),
      };
    }
  }
};
