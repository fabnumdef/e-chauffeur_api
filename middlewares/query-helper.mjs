// eslint-disable-next-line import/prefer-default-export
export const ensureThatFiltersExists = (...requiredFilters) => async (ctx, next) => {
  ctx.assert(ctx.query, 400, 'No query string found');
  const { filters } = ctx.query;
  ctx.assert(filters, 400, '"filters" not found in query string');
  requiredFilters.forEach((key) => ctx.assert(filters[key], 400, `"${key}" filter is required`));
  await next();
};
export const filtersToObject = (...filtersToParse) => async (ctx, next) => {
  ctx.assert(ctx.query, 400, 'No query string found');
  const { filters } = ctx.query;
  ctx.assert(filters, 400, '"filters" not found in query string');
  filtersToParse.forEach((key) => { if (filters[key]) ctx.filters[key] = JSON.parse(filters[key]); });
  await next();
};
