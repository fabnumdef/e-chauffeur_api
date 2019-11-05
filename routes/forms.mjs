import Router from 'koa-router';
import mongoose from 'mongoose';
import { prepareSendMailFromTemplate } from '../services/mail';
import config from '../services/config';
import Rating from '../models/rating';

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
          rideId,
        },
      },
    } = ctx;

    if (!rideId || !uxGrade || !recommandationGrade) {
      ctx.throw_and_log(400, 'RideId, uxGrade & recommandationGrade should be set');
    }

    const ride = { _id: mongoose.Types.ObjectId(rideId) };

    await Rating.create({
      ride,
      uxGrade,
      recommandationGrade,
      message,
    });

    ctx.status = 204;
  },
);

export default router.routes();
