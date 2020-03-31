import generateCRUD from '../../helpers/abstract-route';
import LoopTimeSlot from '../../models/loop/time-slot';
import {
  CAN_CREATE_TIME_SLOT,
  CAN_EDIT_TIME_SLOT,
  CAN_LIST_TIME_SLOT,
  CAN_REMOVE_TIME_SLOT,
} from '../../models/rights';
import { ensureThatFiltersExists } from '../../middlewares/query-helper';

const router = generateCRUD(LoopTimeSlot, {
  create: { right: CAN_CREATE_TIME_SLOT },
  list: {
    right: CAN_LIST_TIME_SLOT,
    filters: {
      campus: 'campus._id',
    },
    middlewares: [
      ensureThatFiltersExists('after', 'before'),
    ],
    async main(ctx) {
      const { offset, limit } = ctx.parseRangePagination(LoopTimeSlot, { max: 100 });
      const after = new Date(ctx.query.filters.after);
      const before = new Date(ctx.query.filters.before);

      const total = await LoopTimeSlot.countDocumentsWithin(after, before, ctx.filters);
      const data = await LoopTimeSlot.findWithin(after, before, ctx.filters)
        .skip(offset)
        .limit(limit).lean();

      ctx.setRangePagination(LoopTimeSlot, {
        total, offset, count: data.length, limit,
      });

      ctx.body = data;
      ctx.log.info(`Find query in ${LoopTimeSlot.modelName}`);
    },
  },
  delete: {
    right: CAN_REMOVE_TIME_SLOT,
    filters: { campus: 'campus._id' },
  },
  update: {
    right: CAN_EDIT_TIME_SLOT,
    filters: { campus: 'campus._id' },
  },
});

export default router;
