import { RIDE_MODEL_NAME, LOOP_MODEL_NAME } from '../models/helpers/constants';

const PREFETCH_RIDE_KEY = Symbol('prefetched-ride');
const PREFETCH_LOOP_KEY = Symbol('prefetched-loop');

export const getPrefetchedDocument = (ctx, id, modelName) => {
  switch (modelName) {
    case RIDE_MODEL_NAME:
      return ctx.state[PREFETCH_RIDE_KEY][id];
    case LOOP_MODEL_NAME:
      return ctx.state[PREFETCH_LOOP_KEY][id];
    default:
      return null;
  }
};

export const prefetchMiddleware = (Model) => async (ctx, next) => {
  const { modelName } = Model;
  const { id } = ctx.params;
  let key;

  if (modelName === RIDE_MODEL_NAME) {
    key = PREFETCH_RIDE_KEY;
  } else if (modelName === LOOP_MODEL_NAME) {
    key = PREFETCH_LOOP_KEY;
  } else {
    ctx.throw_and_log(422, 'Model not provided');
  }

  ctx.state[key] = ctx.state[key] || {};
  ctx.state[key][id] = await Model.findById(id);

  if (!ctx.state[key][id]) {
    ctx.throw_and_log(404, `${Model.modelName} "${id}" not found`);
  }

  await next();
};
