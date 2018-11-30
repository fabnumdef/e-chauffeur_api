import mask from 'json-mask';

function cleanObject(e) {
  let item = e;
  if (item.toCleanObject) {
    item = e.toCleanObject();
  } else if (item.toObject) {
    item = e.toObject();
  }
  item.id = item._id;
  delete item._id;
  delete item.__v;
  return item;
}

export default async (ctx, next) => {
  await next();
  if (typeof ctx.body === 'object') {
    if (Array.isArray(ctx.body)) {
      ctx.body = ctx.body.map(cleanObject);
    }
    ctx.body = cleanObject(ctx.body);
  }
  ctx.body = mask(ctx.body, (ctx.query || {}).mask || ',');
};
