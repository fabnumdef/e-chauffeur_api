import Prometheus from 'prom-client';

const httpRequestDurationMicroseconds = new Prometheus.Histogram({
  name: 'http_request_duration_ms',
  help: 'Duration of HTTP requests in ms',
  labelNames: ['method', 'route', 'code'],
  buckets: [0.10, 5, 15, 50, 100, 200, 300, 400, 500],
});

export default () => async (ctx, next) => {
  const startEpoch = Date.now();
  await next();
  const responseTimeInMs = Date.now() - startEpoch;

  httpRequestDurationMicroseconds
    // eslint-disable-next-line no-underscore-dangle
    .labels(ctx.method, ctx._matchedRoute, ctx.status)
    .observe(responseTimeInMs);
};
