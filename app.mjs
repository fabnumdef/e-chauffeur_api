import Koa from 'koa';
import bodyParser from 'koa-bodyparser';
import qsParser from 'koa-qs';
import jwt from 'koa-jwt';
import cors from '@koa/cors';
import rangePaginationMiddleware from './middlewares/range-pagination';
import routes from './routes';
import config from './services/config';

const app = new Koa();
qsParser(app);
app.use(rangePaginationMiddleware);
app.use(cors({
  exposeHeaders: ['Content-Range', 'Accept-Ranges'],
})); // @todo: fine tune, for security
app.use(bodyParser());
app.use(jwt({ secret: config.get('token:secret'), passthrough: true }));
app
  .use(routes);

export default app;
