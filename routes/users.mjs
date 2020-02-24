import generateCRUD from '../helpers/abstract-route';
import User from '../models/user';
import NotificationDevice from '../models/notification-device';
import {
  CAN_CREATE_USER, CAN_EDIT_SELF_USER_NAME, CAN_EDIT_SELF_USER_PASSWORD,
  CAN_SEND_CREATION_TOKEN,
  CAN_EDIT_USER,
  CAN_EDIT_USER_SENSITIVE_DATA,
  CAN_GET_USER,
  CAN_LIST_USER,
  CAN_REMOVE_USER, CAN_REMOVE_SELF_USER,
  CAN_EDIT_USER_WITHOUT_UPPER_RIGHTS,
} from '../models/rights';
import config from '../services/config';
import { csvToJson } from '../middlewares/csv-to-json';
import contentNegociation from '../middlewares/content-negociation';
import maskOutput from '../middlewares/mask-output';

const X_SEND_TOKEN = 'x-send-token';
const addDomainInError = (e) => [
  400,
  e.errors ? { whitelistDomains: config.get('whitelist_domains'), errors: e.errors } : e,
];
const router = generateCRUD(User, {
  create: {
    right: [CAN_CREATE_USER, CAN_SEND_CREATION_TOKEN],
    main: async (ctx) => {
      const { request: { body } } = ctx;

      if (!body.password) {
        delete body.password;
      }

      if (!ctx.may(CAN_EDIT_USER_SENSITIVE_DATA)) {
        delete body.email_confirmed;
        if (body.phone) {
          delete body.phone.canonical;
          delete body.phone.confirmed;
        }
      }

      const emailO = { email: body.email };
      const userExists = await User.findByEmail(body.email);
      if ((ctx.headers[X_SEND_TOKEN] && ctx.headers[X_SEND_TOKEN] !== 'false') && ctx.may(CAN_SEND_CREATION_TOKEN)) {
        if (userExists) {
          const { token } = await userExists.generateResetToken(emailO);
          try {
            await userExists.save();
          } catch (e) {
            ctx.throw_and_log(...addDomainInError(e));
          }
          await userExists.sendResetPasswordMail(token);
          ctx.log(ctx.log.INFO, `Password reset requested by ${body.email}.`);
        } else {
          const user = new User(emailO);
          const { token } = await user.generateResetToken(emailO);
          try {
            await user.save();
          } catch (e) {
            ctx.throw_and_log(...addDomainInError(e));
          }
          await user.sendRegistrationTokenMail(token);
          ctx.log(ctx.log.INFO, `User creation requested by ${body.email}.`);
        }
        ctx.status = 204;
      } else if (ctx.may(CAN_CREATE_USER)) {
        if (userExists) {
          ctx.throw_and_log(409, `User email ${body.email} already existing.`);
        }
        try {
          if (body.roles) {
            const bodyWithoutRole = { ...body };
            delete bodyWithoutRole.roles;
            const user = new User(bodyWithoutRole);
            ctx.assert(
              user.checkRolesRightsIter(body.roles || [])
                .reduce(
                  (acc, cur) => cur.reduce((a, c) => a || ctx.may(...[].concat(c)), !(cur.length > 0)) && acc,
                  true,
                ),
              403,
              'You\'re not authorized to create this user',
            );
          }
          ctx.body = await User.create(body);
        } catch (e) {
          ctx.throw_and_log(...addDomainInError(e));
        }
        ctx.log(ctx.log.INFO, `${User.modelName} "${body.id}" has been created`);
      } else {
        ctx.status = 403;
      }
    },
  },
  get: {
    right: CAN_GET_USER,
    lean: false,
  },
  delete: {
    paramId: 'user_id',
    right: [CAN_REMOVE_USER, CAN_REMOVE_SELF_USER],
  },
  list: {
    right: CAN_LIST_USER,
    middlewares: [
      contentNegociation,
      maskOutput,
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
    lean: false,
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

      if (ctx.may(CAN_EDIT_SELF_USER_NAME) && body.firstname) {
        userBody.firstname = body.firstname;
      }

      if (ctx.may(CAN_EDIT_SELF_USER_NAME) && body.lastname) {
        userBody.lastname = body.lastname;
      }
      const user = await User.findById(id);

      if (body.roles) {
        ctx.assert(
          user.checkRolesRightsIter(body.roles || [])
            .reduce(
              (acc, cur) => cur.reduce((a, c) => a || ctx.may(...[].concat(c)), !(cur.length > 0)) && acc,
              true,
            ),
          403,
          'You\'re not authorized to change this role',
        );
      }

      if (!ctx.may(CAN_EDIT_USER_SENSITIVE_DATA)) {
        delete body.email_confirmed;
        if (body.phone) {
          delete body.phone.canonical;
          delete body.phone.confirmed;
        }
      }

      user.set(body);

      if (!user.phone.confirmed && body.phone && body.phone.token) {
        await user.confirmPhone(body.phone.token);
      }

      if (!user.email_confirmed && body.email && body.email_token) {
        await user.confirmEmail(body.email_token);
      }
      ctx.assert(
        ctx.may(CAN_EDIT_USER_WITHOUT_UPPER_RIGHTS, user),
        403,
        'You\'re not authorized to update this user',
      );
      ctx.body = await user.save();

      if ((ctx.headers[X_SEND_TOKEN] && ctx.headers[X_SEND_TOKEN] !== 'false')) {
        const toSend = ctx.headers[X_SEND_TOKEN].split(',');
        if (toSend.includes('email') && !user.email_confirmed) {
          const { token } = await user.generateResetToken({ email: user.email });
          try {
            await user.save();
          } catch (e) {
            ctx.throw_and_log(...addDomainInError(e));
          }
          await user.sendVerificationMail(token);
        }
        if (toSend.includes('phone') && !user.phone.confirmed) {
          const { token } = await user.generateResetToken({ phone: user.phone.canonical });
          try {
            await user.save();
          } catch (e) {
            ctx.throw_and_log(...addDomainInError(e));
          }
          await user.sendVerificationSMS(token);
        }
      }

      ctx.log(
        ctx.log.INFO,
        `${User.modelName} "${id}" has been modified`,
        { body },
      );
    },
  },
  batch: {
    right: [CAN_CREATE_USER],
    refs: ['email'],
    middlewares: [csvToJson],
  },
});

router.post(
  '/:userId/subscribe-device',
  async (ctx) => {
    const { request: { body } } = ctx;
    body.user = {
      _id: ctx.params.userId,
    };
    await NotificationDevice.findOneAndUpdateByUser(body);
    ctx.status = 204;
  },
);

export default router;
