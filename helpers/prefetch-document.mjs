import { RIDE_MODEL_NAME, SHUTTLE_MODEL_NAME } from '../models/helpers/constants';

const PREFETCH_RIDE_KEY = Symbol('prefetched-ride');
const PREFETCH_SHUTTLE_KEY = Symbol('prefetched-shuttle');

export const getPrefetchedDocument = function getPrefetchedDocument(id, Model) {
  const { modelName } = Model;
  switch (modelName) {
    case RIDE_MODEL_NAME:
      return this.state[PREFETCH_RIDE_KEY][id];
    case SHUTTLE_MODEL_NAME:
      return this.state[PREFETCH_SHUTTLE_KEY][id];
    default:
      return null;
  }
};

export const prefetchMiddleware = (Model) => async (ctx, next) => {
  const { modelName } = Model;
  const { id } = ctx.params;
  let key;

  ctx.getPrefetchedDocument = getPrefetchedDocument;

  if (modelName === RIDE_MODEL_NAME) {
    key = PREFETCH_RIDE_KEY;
  } else if (modelName === SHUTTLE_MODEL_NAME) {
    key = PREFETCH_SHUTTLE_KEY;
  } else {
    ctx.throw_and_log(400, 'Model not provided');
  }

  ctx.state[key] = ctx.state[key] || {};
  ctx.state[key][id] = await Model.findById(id);

  if (!ctx.state[key][id]) {
    ctx.throw_and_log(404, `${Model.modelName} "${id}" not found`);
  }

  await next();
};
