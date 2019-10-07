import https from 'https';
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
const token = config.get('sms_factor:token');

const options = {
  hostname: 'api.smsfactor.com',
  port: 443,
  path: '/send',
  method: 'POST',
  headers: {
    Accept: 'application/json',
    Authorization: `Bearer ${token}`,
  },
};

export async function sendSMS(to, body) {
  if (!token) {
    throw new Error('Token is missing');
  }
  const data = JSON.stringify({
    sms: {
      message: {
        text: body,
        sender: 'e-Chauffeur',
      },
      recipients: {
        gsm: [
          {
            value: to,
          },
        ],
      },
    },
  });

  const req = https.request(options, (res) => {
    res.on('data', (d) => {
      process.stdout.write(d);
    });
  });
  req.write(data);
  req.end();
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
