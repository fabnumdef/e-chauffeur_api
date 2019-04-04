import qs from 'qs';

export default async (ctx, next) => {
  ctx.setRangePagination = (entity, {
    total,
    offset,
    count,
    limit = 30,
  }) => {
    const name = (entity.getDashedName && entity.getDashedName()) || entity.modelName.toLowerCase();
    ctx.set('Accept-Ranges', name);
    ctx.set('Content-Range', `${name} ${offset}-${Math.max(offset + count - 1, 0)}/${total}#${limit}`);
  };

  ctx.parseRangePagination = (entity, { max = 30 } = {}) => {
    const name = (entity.getDashedName && entity.getDashedName()) || entity.modelName.toLowerCase();
    const range = qs.parse(ctx.headers.range || '')[name] || '';
    const [lower, higher] = range.split('-').map(n => parseInt(n, 10));
    return {
      offset: lower || 0,
      limit: Math.min(higher ? higher - lower + 1 : max) || max,
    };
  };

  await next();
};
