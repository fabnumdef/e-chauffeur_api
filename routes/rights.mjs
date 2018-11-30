import Router from 'koa-router';

import rights from '../models/rights.json';

const router = new Router();

router.get(
  '/',
  async (ctx) => {
    if (ctx.query && ctx.query.search) {
      ctx.body = rights.filter(r => r.includes(ctx.query.search));
    } else {
      ctx.body = rights;
    }
  },
);

export default router.routes();
