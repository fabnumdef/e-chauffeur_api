// eslint-disable-next-line import/prefer-default-export
export const ensureThatFiltersExists = (...requiredFilters) => async (ctx, next) => {
  ctx.assert(ctx.query, 400, 'No query string found');
  const { filters } = ctx.query;
  ctx.assert(filters, 400, '"filters" not found in query string');
  requiredFilters.forEach(key => ctx.assert(filters[key], 400, `"${key}" filter is required`));
  await next();
};

export const hasFilters = (groupNameFilters, ...nameFilters) => async (ctx, next) => {
  if (!ctx.hasFilters
    && (ctx.query && ctx.query.filters)
  ) {
    const queryFilters = Object.keys(ctx.query.filters);
    const filtersExists = nameFilters.every(
      filter => queryFilters.includes(filter),
    );

    if (filtersExists) {
      ctx.hasFilters = groupNameFilters;
    }
  }
  await next();
};
