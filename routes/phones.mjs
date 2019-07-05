import generateCRUD from '../helpers/abstract-route';

import Phone from '../models/phone';

import {
  CAN_CREATE_PHONE_LOCAL,
  CAN_EDIT_PHONE_LOCAL,
  CAN_GET_PHONE_LOCAL,
  CAN_LIST_PHONE_LOCAL,
  CAN_REMOVE_PHONE_LOCAL,
} from '../models/rights';

const router = generateCRUD(Phone, {
  create: {
    right: CAN_CREATE_PHONE_LOCAL,
  },
  list: {
    right: CAN_LIST_PHONE_LOCAL,
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
});

export default router.routes();
