import Router from 'koa-router';
import { prepareSendMailFromTemplate } from '../services/mail';
import config from '../services/config';

const router = new Router();

router.post(
  '/contact',
  async (ctx) => {
    const {
      request: { body: { message, firstname: name, email } },
    } = ctx;

    const to = config.get('mail:feedback_mail');
    if (!message || !email) {
      ctx.throw_and_log(400, 'Feedback message and email should be set');
    }

    const subject = `[Contact] by ${name} : ${email}`;

    // Parse line breaker of textarea
    const formattedMessage = message.replace(/(\r\n|\n\r|\r|\n)/g, '<br>');

    const sendContactMail = prepareSendMailFromTemplate(
      'feedback',
      subject,
    );

    await sendContactMail(to, {
      subject,
      message: formattedMessage,
    });

    ctx.body = { message: 'Feedback sent' };
  },
);

export default router.routes();
