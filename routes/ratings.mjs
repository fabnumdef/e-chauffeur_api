import generateCRUD from '../helpers/abstract-route';
import Rating from '../models/rating';
import {
  CAN_CREATE_RATING,
  CAN_LIST_RATING,
  CAN_GET_RATING,
} from '../models/rights';
import contentNegociation from '../middlewares/content-negociation';
import maskOutput from '../middlewares/mask-output';

const router = generateCRUD(Rating, {
  create: {
    right: CAN_CREATE_RATING,
    successCode: 204,
  },
  list: {
    right: CAN_LIST_RATING,
    middlewares: [
      contentNegociation,
      maskOutput,
    ],
    async main(ctx) {
      const { offset, limit } = ctx.parseRangePagination(Rating);
      let campusFilter = {};
      if (ctx.query.filters && ctx.query.filters.campus) {
        campusFilter = Rating.generateCampusFilter(ctx.query.filters.campus);
      }

      const [total, data] = await Promise.all([
        Rating.countDocuments(campusFilter),
        Rating.find(campusFilter).skip(offset).limit(limit).sort({ createdAt: 'desc' })
          .lean(),
      ]);

      ctx.log.info(
        {
          filters: ctx.filters, offset, limit, total,
        },
        `Find query in ${Rating.modelName}`,
      );

      ctx.setRangePagination(Rating, {
        total, offset, count: data.length, limit,
      });
      ctx.body = data;
    },
  },
  get: {
    right: CAN_GET_RATING,
    middlewares: [maskOutput],
  },
});

export default router;
