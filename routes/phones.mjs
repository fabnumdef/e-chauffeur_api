import generateCRUD from '../helpers/abstract-route';

import Phone from '../models/phone';

import {
  CAN_CREATE_PHONE_LOCAL,
  CAN_EDIT_PHONE_LOCAL,
  CAN_GET_PHONE_LOCAL,
  CAN_LIST_PHONE_LOCAL,
  CAN_REMOVE_PHONE_LOCAL,
} from '../models/rights';
import { csvToJson, validateCampus } from '../middlewares/csv-to-json';
import contentNegociation from '../middlewares/content-negociation';
import maskOutput from '../middlewares/mask-output';

const router = generateCRUD(Phone, {
  create: {
    right: CAN_CREATE_PHONE_LOCAL,
  },
  list: {
    right: CAN_LIST_PHONE_LOCAL,
    filters: {
      campus: 'campus._id',
    },
    middlewares: [
      contentNegociation,
      maskOutput,
    ],
  },
  get: {
    right: CAN_GET_PHONE_LOCAL,
  },
  delete: {
    right: CAN_REMOVE_PHONE_LOCAL,
  },
  update: {
    right: CAN_EDIT_PHONE_LOCAL,
    main: async (ctx) => {
      const { params: { id }, request: { body } } = ctx;

      const phone = await Phone.findById(id);
      if (!phone) {
        ctx.throw_and_log(404, `The phone with serial number ${id} has not been finded.`);
      }

      if (!body.owner) {
        delete body.owner;
        phone.owner = null;
      }

      if (!body.campus) {
        delete body.campus;
        phone.campus = null;
      }

      if (!body.state) {
        delete body.state;
        phone.state = null;
      }

      phone.set(body);
      ctx.body = await phone.save();
      ctx.log(ctx.log.INFO, `${Phone.modelName} "${body.id}" has been updated.`);
    },
  },
  batch: {
    right: CAN_CREATE_PHONE_LOCAL,
    refs: ['_id', 'label'],
    middlewares: [
      csvToJson,
      validateCampus,
    ],
  },
});

export default router.routes();
