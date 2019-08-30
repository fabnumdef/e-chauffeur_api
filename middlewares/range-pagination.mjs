import qs from 'qs';

export const HEADER_ACCEPT_RANGES = 'X-Accept-Ranges';
export const HEADER_CONTENT_RANGES = 'X-Content-Range';
export const HEADER_RANGE = 'x-range';
export default async (ctx, next) => {
  ctx.setRangePagination = (entity, {
    total,
    offset,
    count,
    limit = 30,
  }) => {
    const name = (entity.getDashedName && entity.getDashedName()) || entity.modelName.toLowerCase();
    ctx.set(HEADER_ACCEPT_RANGES, name);
    ctx.set(HEADER_CONTENT_RANGES, `${name} ${offset}-${Math.max(offset + count - 1, 0)}/${total}#${limit}`);
  };

  ctx.parseRangePagination = (entity, { max = 30 } = {}) => {
    const name = (entity.getDashedName && entity.getDashedName()) || entity.modelName.toLowerCase();
    const range = qs.parse(ctx.headers[HEADER_RANGE] || '')[name] || '';
    const [lower, higher] = range.split('-').map((n) => parseInt(n, 10));
    return {
      offset: lower || 0,
      limit: Math.min(!Number.isNaN(higher) ? higher - lower + 1 : max) || max,
    };
  };

  await next();
};
