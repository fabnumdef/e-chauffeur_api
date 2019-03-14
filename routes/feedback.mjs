import Router from 'koa-router';
import moment from 'moment';
import config from '../services/config';
import checkRights from '../middlewares/check-rights';
import sendMail from '../services/mail';

const router = new Router();

router.post(
  '/',
  checkRights('canSendFeedback'),
  async (ctx) => {
    const {
      request: { body: { message, type } },
      state: { user: { name } },
    } = ctx;
    const base = ctx.state.user.cachedRights[0].campuses[0].name;
    const to = config.get('mail:feedback_mail');
    if (!message || !type) {
      ctx.throw(400);
    }
    const date = moment().format('DD/MM-HH:mm');
    const subject = `[${date}][${type}][${base}] ${name}`;
    await sendMail(to, {
      subject,
      text: message,
    });
    ctx.body = { message: 'Feedback sent' };
  },
);

export default router.routes();
