import Koa from 'koa';
import bodyParser from 'koa-bodyparser';
import qsParser from 'koa-qs';
import jwt from 'koa-jwt';
import cors from '@koa/cors';
import rangePaginationMiddleware from './middlewares/range-pagination';
import routes from './routes';
import config from './services/config';
import { loggerMiddleware } from './services/logger';
import { injectUserMayMiddleware } from './middlewares/check-rights';

const app = new Koa();
app.use(jwt({ secret: config.get('token:secret'), passthrough: true }));
app.use(injectUserMayMiddleware);
app.use(loggerMiddleware);
qsParser(app);
app.use(rangePaginationMiddleware);
app.use(cors({
  exposeHeaders: ['Content-Range', 'Accept-Ranges'],
})); // @todo: fine tune, for security
app.use(bodyParser());
app
  .use(routes);

export default app;
