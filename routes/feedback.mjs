import Router from 'koa-router';
import _get from 'lodash.get';
import Luxon from 'luxon';
import config from '../services/config';
import resolveRights from '../middlewares/check-rights';
import sendMail from '../services/mail';
import { CAN_SEND_FEEDBACK } from '../models/rights';

const { DateTime } = Luxon;
const router = new Router();

router.post(
  '/',
  resolveRights(CAN_SEND_FEEDBACK),
  async (ctx) => {
    const {
      request: { body: { message, type } },
      state: { user: { name, email } },
    } = ctx;

    const base = _get(ctx.state.user, 'roles[0].campuses[0].name', 'NC');

    const to = config.get('mail:feedback_mail');
    if (!message || !type) {
      ctx.throw_and_log(400, 'Feedback message and type should be set');
    }

    const date = DateTime.local().setLocale('fr').toFormat('dd/LL-HH:mm');

    const subject = `[${date}][${type}][${base}] From Feedback page by ${name} : ${email}`;

    await sendMail(to, {
      subject,
      text: message,
    });

    ctx.body = { message: 'Feedback sent' };
  },
);

export default router.routes();
