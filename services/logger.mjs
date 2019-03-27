import winston from 'winston';
import 'winston-mongodb';
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
