export default (id, mongoPath) => async (ctx, next) => {
  const queryFilters = ((ctx.query || {}).filters || {});
  const filters = ctx.filters || {};
  if (queryFilters[id]) {
    filters[mongoPath] = queryFilters[id];
    delete ctx.query.filters[id];
  }
  ctx.filters = filters;
  await next();
};
