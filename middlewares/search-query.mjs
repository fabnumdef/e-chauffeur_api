export default async (ctx, next) => {
  const searchParams = ctx.filters;
  if (ctx.query && ctx.query.search) {
    searchParams.$text = { $search: ctx.query.search };
  }
  ctx.filters = searchParams;
  await next();
};
