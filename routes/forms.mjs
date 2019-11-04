import Router from 'koa-router';
import { prepareSendMailFromTemplate } from '../services/mail';
import config from '../services/config';
import Rating from '../models/ratings';

const router = new Router();

router.post(
  '/contact',
  async (ctx) => {
    const {
      request: {
        body: {
          message, firstname: name, email, gsbdd: base,
        },
      },
    } = ctx;

    const to = config.get('mail:feedback_mail');
    if (!message || !email || !name) {
      ctx.throw_and_log(400, 'Feedback message, email and name should be set');
    }

    const subject = `[Contact][Base: ${base}] sent by ${name}`;

    // Parse line breaker of textarea
    const formattedMessage = message.replace(/(\r\n|\n\r|\r|\n)/g, '<br>');

    const sendContactMail = prepareSendMailFromTemplate(
      'feedback',
      subject,
    );

    await sendContactMail(to, {
      data: {
        message: formattedMessage,
        email,
      },
    });

    ctx.body = { message: 'Feedback sent' };
  },
);

router.post(
  '/rating',
  async (ctx) => {
    const {
      request: {
        body: {
          message,
          uxGrade,
          recommandationGrade,
          gsbdd: base,
        },
      },
      state: {
        user: { name, email },
      },
    } = ctx;

    console.log(message, uxGrade, recommandationGrade, base);

    const newRating = Rating.create({
      name,
      email,
      base,
      uxGrade,
      recommandationGrade,
      message,
    });

    const to = config.get('mail:feedback_mail');

    if (!base || !uxGrade || !recommandationGrade) {
      ctx.throw_and_log(400, 'Feedback grades and base should be set');
    }

    const subject = `[Rating][Base: ${base}] sent by ${name}`;

    let formattedMessage;
    if (message) {
      formattedMessage = message.replace(/(\r\n|\n\r|\r|\n)/g, '<br>');
    }

    const sendContactMail = prepareSendMailFromTemplate(
      'satisfaction',
      subject,
    );

    await sendContactMail(to, {
      data: {
        name,
        email,
        uxGrade,
        recommandationGrade,
        message: formattedMessage,
      },
    });

    ctx.body = {
      rating: await newRating,
      message: 'Rating sent',
    };
  },
);

export default router.routes();
