import mask from 'json-mask';
import transform from 'lodash.transform';
import isPlainObject from 'lodash.isplainobject';

export function cleanObject(e, ctx) {
  if (!e) {
    return e;
  }

  let item = e;
  if (e.toCleanObject) {
    item = e.toCleanObject({ virtuals: true }, ctx);
  } else if (e.toObject) {
    item = e.toObject({ virtuals: true });
  }

  if (!isPlainObject(item) && !Array.isArray(item)) {
    return item;
  }

  return transform(item, (acc, val, key) => {
    if (['__v'].includes(key)) {
      return;
    }
    acc[key.replace ? key.replace(/^_/g, '') : key] = cleanObject(val, ctx);
  });
}

export const mergeMasks = (...masks) => masks.map((item) => item.split(','))
  .reduce((acc, arrayOfItems) => {
    const newAcc = [...acc];
    arrayOfItems.forEach((item) => {
      let toAdd = true;
      acc.forEach((accItem) => {
        if (item === accItem) {
          toAdd = false;
        }
      });
      if (toAdd) {
        newAcc.push(item);
      }
    });
    return newAcc;
  }, [])
  .join(',');

export default async (ctx, next) => {
  await next();
  if (typeof ctx.body === 'object') {
    ctx.body = cleanObject(ctx.body, ctx);
    ctx.body = mask(ctx.body, (ctx.query || {}).mask || ',');
  }
};
