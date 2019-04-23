import Router from 'koa-router';
import sprintf from 'sprintf-lite';
import validator from '../helpers/validator';
import sendMail from '../services/mail';
import config from '../services/config';

const router = new Router();

router.post(
  '/contact',
  async (ctx) => {
    const formFields = ctx.request.body;
    const match = await validator.check(formFields, {
      firstname: 'required',
      lastname: 'required',
      email: 'required|email',
      phone: 'numeric',
      gsbdd: 'required',
      message: 'required',
    });

    ctx.assert(match.matched, 422, 'One or more fields are not valid.');

    const mailOptions = {
      subject: sprintf.default(config.get('mail:subject'), formFields),
      text: sprintf.default(config.get('mail:text'), formFields),
    };

    // Parse line breaker of textarea
    if (config.get('mail:html') && formFields.message) {
      const htmlParseLB = formFields.message.replace(/(\r\n|\n\r|\r|\n)/g, '<br>');
      Object.assign(mailOptions,
        {
          html: sprintf.default(config.get('mail:html'), { message: htmlParseLB }),
        });
    }

    try {
      await sendMail(config.get('mail:contact_mail'), mailOptions);
      ctx.status = 204;
    } catch (e) {
      ctx.throw_and_log(500, `Not available to send a mail (Err : ${e.message}).`);
    }
  },
);

export default router.routes();
