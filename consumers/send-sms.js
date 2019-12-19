import container from 'rhea';
import Twilio from 'twilio';
import services from '../services';
import config from '../services/config';
import { SEND_SMS_QUEUE } from '../services/twilio';

(async () => {
  /* eslint-disable camelcase */
  await services;
  const sid = config.get('twilio:sid');
  const token = config.get('twilio:token');
  const messagingServiceSid = config.get('twilio:messaging_service_sid');

  if (!sid || !token || !messagingServiceSid) {
    throw new Error('sid nor token nor sender is missing');
  }

  const amqp = config.get('amqp');
  if (!amqp) {
    return;
  }
  container.on('message', async ({ message: { body: { body, to } } }) => {
    if (!body || !to) {
      return;
    }
    const client = new Twilio(sid, token);
    await client.messages.create({
      body,
      to,
      messagingServiceSid,
    });
  });
  container.connect(amqp).open_receiver(SEND_SMS_QUEUE);
})();
