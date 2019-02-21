import Twilio from 'twilio';
import config from './config';

const sid = config.get('twilio:sid');
const token = config.get('twilio:token');
const messagingServiceSid = config.get('twilio:messagingServiceSid');

// eslint-disable-next-line import/prefer-default-export
export async function sendSMS(to, body) {
  if (!sid || !token || !messagingServiceSid) {
    throw new Error('sid nor token nor sender is missing');
  }
  const client = new Twilio(sid, token);
  return client.messages.create({
    body,
    to,
    messagingServiceSid,
  });
}
