import generateCRUD from '../../helpers/abstract-route';
import TimeSlot from '../../models/time-slot';
import {
  CAN_CREATE_TIME_SLOT,
  CAN_EDIT_TIME_SLOT,
  CAN_LIST_TIME_SLOT,
  CAN_REMOVE_TIME_SLOT,
} from '../../models/rights';
import { ensureThatFiltersExists, filtersFromParams, filtersToObject } from '../../middlewares/query-helper';

const router = generateCRUD(TimeSlot, {
  create: {
    right: CAN_CREATE_TIME_SLOT,
  },
  list: {
    right: CAN_LIST_TIME_SLOT,
    middlewares: [
      ensureThatFiltersExists('after', 'before'),
      filtersToObject('drivers', 'cars'),
      filtersFromParams('campus._id', 'campus_id'),
    ],
    async main(ctx) {
      const { offset, limit } = ctx.parseRangePagination(TimeSlot, { max: 100 });
      const after = new Date(ctx.query.filters.after);
      const before = new Date(ctx.query.filters.before);

      const total = await TimeSlot.countDocumentsWithin(after, before, ctx.filters);
      const data = await TimeSlot.findWithin(after, before, ctx.filters).skip(offset).limit(limit).lean();
      ctx.setRangePagination(TimeSlot, {
        total, offset, count: data.length, limit,
      });

      ctx.body = data;
      ctx.log.info(`Find query in ${TimeSlot.modelName}`);
    },
  },
  delete: {
    right: CAN_REMOVE_TIME_SLOT,
  },
  update: {
    right: CAN_EDIT_TIME_SLOT,
  },
});

export default router;
