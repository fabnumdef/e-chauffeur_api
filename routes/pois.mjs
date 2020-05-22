import generateCRUD from '../helpers/abstract-route';
import Poi from '../models/poi';
import {
  CAN_CREATE_POI_LOCAL,
  CAN_EDIT_POI_LOCAL,
  CAN_GET_POI,
  CAN_LIST_POI,
  CAN_REMOVE_POI_LOCAL,
} from '../models/rights';
import { csvToJson, validateCampus } from '../middlewares/csv-to-json';
import contentNegociation from '../middlewares/content-negociation';
import maskOutput from '../middlewares/mask-output';
import searchQuery from '../middlewares/search-query';
import { filtersFromParams } from '../middlewares/query-helper';

const router = generateCRUD(Poi, {
  create: {
    right: CAN_CREATE_POI_LOCAL,
  },
  get: {
    right: CAN_GET_POI,
  },
  delete: {
    right: CAN_REMOVE_POI_LOCAL,
  },
  update: {
    right: CAN_EDIT_POI_LOCAL,
  },
  list: {
    right: CAN_LIST_POI,
    filters: {
      withDisabled: 'enabled',
    },
    middlewares: [
      contentNegociation,
      maskOutput,
      searchQuery,
      filtersFromParams('campus._id', 'campus_id'),
    ],
    async main(ctx) {
      const { offset, limit } = ctx.parseRangePagination(Poi, { max: 1000 });

      const [total, data] = await Promise.all([
        Poi.countDocumentsWithin(ctx.filters, ctx.query),
        Poi.findWithin(ctx.filters, ctx.query).skip(offset).limit(limit).lean(),
      ]);

      ctx.log.info(
        {
          filters: ctx.filters, offset, limit, total,
        },
        `Find query in ${Poi.modelName}`,
      );

      ctx.setRangePagination(Poi, {
        total, offset, count: data.length, limit,
      });
      ctx.body = data;
    },
  },
  batch: {
    right: CAN_CREATE_POI_LOCAL,
    refs: ['_id'],
    middlewares: [
      csvToJson,
      validateCampus,
    ],
  },
});

export default router;
