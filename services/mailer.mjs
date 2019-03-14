import nodemailer from 'nodemailer';
import config from './config';

export default ({

  async sendMail(mailOptions) {
    const mailerConfig = config.get('mailer:server');
    if (!mailerConfig.host && !mailerConfig.port) {
      throw new Error('The host and port are required for mailer configuration.');
    }

    // true for 465, false for other ports
    mailerConfig.secure = mailerConfig.port === '465';

    try {
      const transporter = nodemailer.createTransport(mailerConfig);
      const info = await transporter.sendMail(mailOptions);
      return info;
    } catch (error) {
      return false;
    }
  },

  replace(string, replace) {
    const delimiter = '%';
    const keys = Object.keys(replace);
    let stringReplace = string;

    keys.forEach((key) => {
      stringReplace = stringReplace.replace(`${delimiter}${key}${delimiter}`, replace[key]);
    });

    return stringReplace;
  },
});
