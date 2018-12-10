import mask from 'json-mask';
import transform from 'lodash.transform';
import isPlainObject from 'lodash.isplainobject';

function cleanObject(e) {
  if (!isPlainObject(e) && !Array.isArray(e)) {
    return e;
  }
  let item = e;

  if (e.toCleanObject) {
    item = e.toCleanObject();
  } else if (e.toObject) {
    item = e.toObject();
  }

  return transform(item, (acc, val, key) => {
    if (['__v'].includes(key)) {
      return;
    }
    acc[key.replace ? key.replace('_', '') : key] = cleanObject(val);
  });
}

export default async (ctx, next) => {
  await next();
  if (typeof ctx.body === 'object') {
    ctx.body = cleanObject(ctx.body);
    ctx.body = mask(ctx.body, (ctx.query || {}).mask || ',');
  }
};
