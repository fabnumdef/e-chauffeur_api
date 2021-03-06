import generateCRUD from '../helpers/abstract-route';
import User from '../models/user';
import NotificationDevice from '../models/notification-device';
import {
  CAN_CREATE_USER,
  CAN_EDIT_SELF_USER_NAME, CAN_EDIT_SELF_USER_PASSWORD, CAN_EDIT_SELF_USER_SENSITIVE_DATA,
  CAN_SEND_CREATION_TOKEN,
  CAN_EDIT_USER,
  CAN_EDIT_USER_SENSITIVE_DATA,
  CAN_GET_USER,
  CAN_LIST_USER,
  CAN_REMOVE_USER, CAN_REMOVE_SELF_USER,
  CAN_EDIT_USER_WITHOUT_UPPER_RIGHTS,
} from '../models/rights';
import { csvToJson } from '../middlewares/csv-to-json';
import contentNegociation from '../middlewares/content-negociation';
import maskOutput from '../middlewares/mask-output';
import searchQuery from '../middlewares/search-query';
import { filtersFromParams } from '../middlewares/query-helper';

const X_SEND_TOKEN = 'x-send-token';
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
      let userExists;
      try {
        userExists = await User.findByEmail(body.email);
      } catch (e) {
        // Do nothing, user will stay undefined
      }
      if ((ctx.headers[X_SEND_TOKEN] && ctx.headers[X_SEND_TOKEN] !== 'false') && ctx.may(CAN_SEND_CREATION_TOKEN)) {
        if (userExists) {
          const { token } = await userExists.generateResetToken(emailO);
          await userExists.save();
          await userExists.sendResetPasswordMail(token);
          ctx.log.info(`Password reset requested by ${body.email}.`);
        } else {
          const user = new User(emailO);
          const { token } = await user.generateResetToken(emailO);
          await user.save();
          await user.sendRegistrationTokenMail(token);
          ctx.log.info(`User creation requested by ${body.email}.`);
        }
        ctx.status = 204;
      } else if (ctx.may(CAN_CREATE_USER)) {
        if (userExists) {
          ctx.log.error(`${User.modelName} "${body.email}" already exists`);
          ctx.throw(
            409,
            ctx.translate(
              'mongoose.errors.AlreadyExists',
              { model: ctx.translate(`mongoose.models.${User.modelName}`), id: body.email },
            ),
          );
        }
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
        ctx.log.info(`${User.modelName} "${body.id}" has been created`);
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
      searchQuery,
      filtersFromParams('campus._id', 'campus_id'),
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

      if (ctx.may(CAN_EDIT_SELF_USER_SENSITIVE_DATA)) {
        if (body.phone) {
          userBody.phone = body.phone;
        }
        if (body.email) {
          userBody.email = body.email;
          userBody.email_token = body.email_token;
        }
        if (body.gprd) {
          userBody.gprd = body.gprd;
        }
      }

      if (ctx.may(CAN_EDIT_SELF_USER_NAME)) {
        if (body.firstname) {
          userBody.firstname = body.firstname;
        }
        if (body.lastname) {
          userBody.lastname = body.lastname;
        }
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

      if (
        !ctx.may(CAN_EDIT_USER_SENSITIVE_DATA)
        && !ctx.may(CAN_EDIT_SELF_USER_SENSITIVE_DATA)
      ) {
        delete userBody.email_confirmed;
        if (userBody.phone) {
          delete userBody.phone.canonical;
          delete userBody.phone.confirmed;
        }
      }

      user.set(userBody);
      if (!user.phone.confirmed && userBody.phone && userBody.phone.token) {
        await user.confirmPhone(body.phone.token);
      }

      if (!user.email_confirmed && userBody.email && userBody.email_token) {
        await user.confirmEmail(userBody.email_token);
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
          await user.save();
          await user.sendVerificationMail(token);
        }
        if (toSend.includes('phone') && !user.phone.confirmed) {
          const { token } = await user.generateResetToken({ phone: user.phone.canonical });
          await user.save();
          await user.sendVerificationSMS(token);
        }
      }

      ctx.log.info(
        { userBody },
        `${User.modelName} "${id}" has been modified`,
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
