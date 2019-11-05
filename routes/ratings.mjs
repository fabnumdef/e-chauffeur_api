import generateCRUD from '../helpers/abstract-route';
import Rating from '../models/rating';
import {
  CAN_CREATE_RATING,
  CAN_LIST_RATING,
} from '../models/rights';

const router = generateCRUD(Rating, {
  create: {
    right: [CAN_CREATE_RATING],
  },
  list: {
    right: [CAN_LIST_RATING],
    async main(ctx) {
      const { offset, limit } = ctx.parseRangePagination(Rating, { max: 1000 });
      const [total, data] = await Promise.all([
        Rating.countDocuments(ctx.filters),
        Rating.find(ctx.filters).skip(offset).limit(limit).sort({ createdAt: 'desc' })
          .lean(),
      ]);

      ctx.log(
        ctx.log.INFO,
        `Find query in ${Rating.modelName}`,
        {
          filters: ctx.filters, offset, limit, total,
        },
      );

      ctx.setRangePagination(Rating, {
        total, offset, count: data.length, limit,
      });
      ctx.body = data;
    },
  },
});

export default router.routes();
