import Nodemailer from 'nodemailer';
import config from './config';

export default async function sendMail(to, options = {}) {
  const conf = config.get('mail');
  if (!conf.auth || (!conf.auth.user && !conf.auth.pass)) {
    delete conf.auth;
  }
  const opts = Object.assign({
    from: '"E-Chauffer" <contact@e-chauffer.com>',
    subject: '',
    text: '',
    html: '',
  }, options);
  if (!opts.html && opts.text) {
    opts.html = `<p>${opts.text}</p>`;
  }
  const transporter = Nodemailer.createTransport(conf);
  const mailOptions = { to, ...opts };
  return transporter.sendMail(mailOptions);
}
