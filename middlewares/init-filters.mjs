export default async (ctx, next) => {
  ctx.filters = ctx.filters || {};
  await next();
};
