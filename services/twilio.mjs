import twilio from 'twilio';
import config from './config';

const sid = config.get('twilio:sid');
const token = config.get('twilio:token');

export default sid && token ? twilio(sid, token) : null;
