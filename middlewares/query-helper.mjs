// eslint-disable-next-line import/prefer-default-export
export const extractStartEndFilters = (ctx) => {
  ctx.assert(ctx.query, 400, 'No query string found');
  ctx.assert(ctx.query.filters, 400, '"filters" not found in query string');
  const { filters } = ctx.query;
  ctx.assert(filters.start && filters.end, 400, '"start" and "end" filters are required');

  return { start: new Date(filters.start), end: new Date(filters.end) };
};
