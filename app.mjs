import url from 'url';
import Koa from 'koa';
import Prometheus from 'prom-client';
import bodyParser from 'koa-body';
import helmet from 'koa-helmet';
import qsParser from 'koa-qs';
import jwt from 'koa-jwt';
import cors from '@koa/cors';
import rangePaginationMiddleware, { HEADER_ACCEPT_RANGES, HEADER_CONTENT_RANGES } from './middlewares/range-pagination';
import routes from './routes';
import config from './services/config';
import { loggerMiddleware } from './services/logger';
import { injectUserMayMiddleware } from './middlewares/check-rights';
import errorHandler from './middlewares/error-handler';
import metricsMiddleware from './middlewares/metrics';

const metricsInterval = Prometheus.collectDefaultMetrics();

process.on('SIGTERM', () => {
  clearInterval(metricsInterval);
});

const app = new Koa();
if (config.get('prometheus_exporter')) {
  app.use(metricsMiddleware);
}
app.use(errorHandler);
app.use(helmet());
app.use(jwt({ secret: config.get('token:secret'), passthrough: true }));
app.use(injectUserMayMiddleware);
app.use(loggerMiddleware);
qsParser(app);
app.use(rangePaginationMiddleware);
let origin;
const userWebsiteDomain = config.get('user_website_url');
if (userWebsiteDomain) {
  const { host } = url.parse(userWebsiteDomain, false);
  origin = (ctx) => {
    if (ctx.headers.host && ctx.headers.host.endsWith(host)) {
      return ctx.headers.host;
    }
    return host;
  };
}
app.use(cors({
  origin,
  exposeHeaders: [HEADER_CONTENT_RANGES, HEADER_ACCEPT_RANGES],
})); // @todo: fine tune, for security
app.use(bodyParser({ multipart: true }));
app.use(routes.routes());
app.use(routes.allowedMethods());

export default app;
