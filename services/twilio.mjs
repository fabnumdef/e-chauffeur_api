import Twilio from 'twilio';
import glob from 'glob';
import nodeFs from 'fs';
import nodePath from 'path';
import Handlebars from 'handlebars';
import nodeUrl from 'url';
import config from './config';

const { readFileSync } = nodeFs;
const { dirname, resolve, join } = nodePath;
const { fileURLToPath } = nodeUrl;

const currentPath = dirname(fileURLToPath(import.meta.url));
const DEFAULT_LANG = 'fr';

const sid = config.get('twilio:sid');
const token = config.get('twilio:token');
const messagingServiceSid = config.get('twilio:messaging_service_sid');

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

function compileTemplates(path, ext) {
  return glob.sync(`${path}.*${ext}`)
    .reduce((acc, curr) => {
      const langRegex = new RegExp(`([a-z]+)${ext.replace('.', '\\.')}$`);
      const [, lang] = langRegex.exec(curr);
      return Object.assign(acc, {
        [lang]: Handlebars.compile(readFileSync(curr).toString()),
      });
    }, {});
}

function prepareSendSMSFromTemplate(template) {
  const path = resolve(join(currentPath, '..', 'templates', 'sms', template));
  const tpl = compileTemplates(path, '.txt.hbs');

  return (to, { data = {}, lang = DEFAULT_LANG }) => {
    if (!tpl[lang]) {
      throw new Error('No mail template found');
    }
    return sendSMS(to, tpl[lang](data));
  };
}

export const sendVerificationSMS = prepareSendSMSFromTemplate(
  'verification',
);
