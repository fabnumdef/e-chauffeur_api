import rhea from 'rhea';
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
export const SEND_SMS_QUEUE = 'sms-to-send';

const amqp = config.get('amqp');

export async function sendSMS(to, body) {
  if (!amqp) {
    // eslint-disable-next-line no-console
    console.log('SMS not sent, AMQP not found');
    return;
  }
  const container = rhea.create_container();
  container.once('sendable', (context) => {
    context.sender.send({ body: { to, body } });
    context.connection.close();
  });
  container.connect(amqp).open_sender(SEND_SMS_QUEUE);
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
