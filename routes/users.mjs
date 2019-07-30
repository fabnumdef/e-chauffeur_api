import generateCRUD from '../helpers/abstract-route';
import User, { LOGIN } from '../models/user';
import {
  CAN_CREATE_USER, CAN_EDIT_SELF_USER_NAME, CAN_EDIT_SELF_USER_PASSWORD,
  CAN_SEND_CREATION_TOKEN,
  CAN_EDIT_USER,
  CAN_GET_USER,
  CAN_LIST_USER,
  CAN_REMOVE_USER,
} from '../models/rights';

const X_SEND_TOKEN = 'x-send-token';

const router = generateCRUD(User, {
  create: {
    right: [CAN_CREATE_USER, CAN_SEND_CREATION_TOKEN],
    main: async (ctx) => {
      const { request: { body } } = ctx;

      if (!body.password) {
        delete body.password;
      }

      const emailO = { email: body.email };
      const userExists = await User.findOne(emailO);
      if (ctx.headers[X_SEND_TOKEN] && ctx.may(CAN_SEND_CREATION_TOKEN)) {
        if (userExists) {
          const { token } = await userExists.generateResetToken(LOGIN, emailO);
          await userExists.sendResetPasswordMail(token);
          ctx.log(`Password reset requested by ${body.email}.`);
        } else {
          const user = await User.create(emailO);
          const { token } = await user.generateResetToken(LOGIN, emailO);
          await user.sendRegistrationTokenMail(token);
          ctx.log(`User creation requested by ${body.email}.`);
        }
        ctx.status = 204;
      } else if (ctx.may(CAN_CREATE_USER)) {
        if (userExists) {
          ctx.throw_and_log(409, `User email ${body.email} already existing.`);
        }

        ctx.body = await User.create(body);
        ctx.log(ctx.log.INFO, `${User.modelName} "${body.id}" has been created`);
      } else {
        ctx.status = 403;
      }
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
    paramId: 'user_id',
    right: [
      CAN_EDIT_USER,
      CAN_EDIT_SELF_USER_NAME,
      CAN_EDIT_SELF_USER_PASSWORD,
    ],
    main: async (ctx) => {
      const { request: { body = {} }, params: { user_id: id } } = ctx;

      if (!body.password) {
        delete body.password;
      }

      const userBody = {};

      if (ctx.may(CAN_EDIT_USER)) {
        Object.assign(userBody, body);
      }

      if (ctx.may(CAN_EDIT_SELF_USER_PASSWORD) && body.password) {
        userBody.password = body.password;
      }

      if (ctx.may(CAN_EDIT_SELF_USER_NAME) && body.name) {
        userBody.name = body.name;
      }

      const user = await User.findById(id);

      if (body.roles) {
        ctx.assert(
          user.checkRolesRightsIter(body.roles || [])
            .reduce(
              (acc, cur) => cur.reduce((a, c) => a || ctx.may(...[].concat(c)), false) && acc,
              true,
            ),
          403,
          'You\'re not authorized to change this role',
        );
      }

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
