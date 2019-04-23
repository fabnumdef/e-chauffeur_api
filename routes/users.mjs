import generateCRUD from '../helpers/abstract-route';
import User from '../models/user';
import {
  CAN_CREATE_USER,
  CAN_EDIT_USER,
  CAN_GET_USER,
  CAN_LIST_USER,
  CAN_REMOVE_USER,
} from '../models/rights';

const router = generateCRUD(User, {
  create: {
    right: CAN_CREATE_USER,
    main: async (ctx) => {
      const { request: { body } } = ctx;

      if (!body.password) {
        delete body.password;
      }

      if (await User.findOne({ email: body.email })) {
        ctx.throw_and_log(409, `User email ${body.email} already existing.`);
      }

      ctx.body = await User.create(body);
      ctx.log(ctx.log.INFO, `${User.modelName} "${body.id}" has been created`);
    },
  },
  get: {
    right: CAN_GET_USER,
  },
  delete: {
    right: CAN_REMOVE_USER,
  },
  list: {
    right: CAN_LIST_USER,
    middlewares: [
      async (ctx, next) => {
        const searchParams = {};
        if (ctx.query && ctx.query.search) {
          searchParams.$or = [
            {
              _id: new RegExp(ctx.query.search, 'i'),
            },
            {
              name: new RegExp(ctx.query.search, 'i'),
            },
          ];
        }
        ctx.filters = searchParams;
        await next();
      },
    ],
  },
  update: {
    right: CAN_EDIT_USER,
    main: async (ctx) => {
      const { request: { body } } = ctx;

      if (!body.password) {
        delete body.password;
      }

      const { params: { id } } = ctx;
      const user = await User.findById(id);
      user.set(body);
      ctx.body = await user.save();
      ctx.log(
        ctx.log.INFO,
        `${User.modelName} "${id}" has been modified`,
        { body },
      );
    },
  },
});

export default router.routes();
