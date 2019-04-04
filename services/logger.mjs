import winston from 'winston';
import 'winston-mongodb';
import Transport from 'winston-transport';

import config from './config';

export const createMongoDBTransport = db => new winston.transports.MongoDB({ db, collection: 'logs' });

export const defaultConsoleTransport = new winston.transports.Console({ level: process.env.LOG_LEVEL || 'warn' });
export const defaultMongoDBTransport = createMongoDBTransport(config.get('mongodb'));

winston.add(defaultMongoDBTransport);
winston.add(defaultConsoleTransport);

export const ERROR = 'error';
export const WARN = 'warn';
export const INFO = 'info';
export const VERBOSE = 'verbose';
export const DEBUG = 'debug';
export const SILLY = 'silly';

export async function loggerMiddleware(ctx, next) {
  ctx.log = (level, message, meta = {}) => {
    const metadata = Object.assign({ user: ctx.state.user }, meta);
    winston.log({ level, message, metadata });
  };

  ctx.log.ERROR = ERROR;
  ctx.log.WARN = WARN;
  ctx.log.INFO = INFO;
  ctx.log.VERBOSE = VERBOSE;
  ctx.log.DEBUG = DEBUG;
  ctx.log.SILLY = SILLY;

  ctx.throw_and_log = (code, message) => {
    ctx.log(ctx.log.ERROR, message);
    ctx.throw(code, message);
  };
  await next();
}

export default winston;

Transport.prototype.normalizeQuery = (options) => {
  /* eslint-disable no-param-reassign */
  options = options || {};

  // limit
  options.rows = options.rows || options.limit || 10;

  // starting row offset
  options.start = options.start || 0;

  // now
  options.until = options.until || new Date();
  if (typeof options.until !== 'object') {
    options.until = new Date(options.until);
  }

  // now - 24
  options.from = options.from || (options.until - (24 * 60 * 60 * 1000));
  if (typeof options.from !== 'object') {
    options.from = new Date(options.from);
  }

  // 'asc' or 'desc'
  options.order = options.order || 'desc';

  return options;
};

Transport.prototype.formatResults = results => results;
