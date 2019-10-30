import Router from 'koa-router';
import Luxon from 'luxon';
import sendMail from '../services/mail';
import config from '../services/config';

const { DateTime } = Luxon;
const router = new Router();

router.post(
  '/contact',
  async (ctx) => {
    const {
      request: { body: { message, firstname: name, email } },
    } = ctx;

    const to = config.get('mail:feedback_mail');
    if (!message || !email) {
      ctx.throw_and_log(400, 'Feedback message and type should be set');
    }
    const date = DateTime.local().setLocale('fr').toFormat('dd/LL-HH:mm');

    const subject = `[${date}] From Contact page by ${name} : ${email}`;

    // Parse line breaker of textarea
    const formattedMessage = message.replace(/(\r\n|\n\r|\r|\n)/g, '<br>');

    await sendMail(to, {
      subject,
      text: formattedMessage,
    });

    ctx.body = { message: 'Feedback sent' };
  },
);

export default router.routes();
