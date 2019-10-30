import Router from 'koa-router';
import config from '../services/config';
import resolveRights from '../middlewares/check-rights';
import sendMail from '../services/mail';
import { CAN_SEND_FEEDBACK } from '../models/rights';

const router = new Router();

router.post(
  '/',
  resolveRights(CAN_SEND_FEEDBACK),
  async (ctx) => {
    const {
      request: { body: { message, type } },
      state: { user: { name, email } },
    } = ctx;

    const to = config.get('mail:feedback_mail');
    if (!message || !type) {
      ctx.throw_and_log(400, 'Feedback message and type should be set');
    }

    const subject = `[Feedback] by ${name} : ${email}`;

    await sendMail(to, {
      subject,
      text: message,
    });

    ctx.body = { message: 'Feedback sent' };
  },
);

export default router.routes();
