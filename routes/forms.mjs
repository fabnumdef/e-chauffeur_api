import Router from 'koa-router';
import mailer from '../services/mailer';
import validator from '../services/validator';
import config from '../services/config';

const router = new Router();

router.post(
  '/contact',
  async (ctx) => {
    const mailerConfig = config.get('mailer:mail');
    const formFields = ctx.request.body;
    const match = await validator.check(formFields, {
      firstname: 'required',
      lastname: 'required',
      email: 'required|email',
      phone: 'numeric',
      gsbdd: 'required',
      message: 'required',
    });

    if (!match.matched) {
      ctx.status = 422;
      ctx.body = 'One or more fields are not valid.';
      return;
    }
    // Parse line breaker
    formFields.message = formFields.message.replace(/(?:\r\n|\r|\n|\\r\\n|\\r|\\n)/g, '<br>');

    const mailOptions = {
      from: mailerConfig.from,
      to: mailerConfig.to,
      subject: mailer.replace(mailerConfig.subject, formFields),
      html: mailer.replace(mailerConfig.body, formFields),
    };

    const isSend = await mailer.sendMail(mailOptions);
    if (!isSend) {
      ctx.status = 500;
      throw new Error('Not available to send a mail.');
    } else {
      ctx.status = 200;
    }
  },
);

export default router.routes();
