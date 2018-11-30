import Koa from 'koa';
import bodyParser from 'koa-bodyparser';
import qsParser from 'koa-qs';
import cors from '@koa/cors';
import rangePaginationMiddleware from './middlewares/range-pagination';
import routes from './routes';

const app = new Koa();
qsParser(app);
app.use(rangePaginationMiddleware);
app.use(cors({
  exposeHeaders: ['Content-Range', 'Accept-Ranges'],
})); // @todo: fine tune, for security
app.use(bodyParser());
app
  .use(routes);

export default app;
