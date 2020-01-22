import Prometheus from 'prom-client';
import http from 'http';
import config from './services/config';

const port = config.get('prometheus_exporter');
if (port) {
  http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': Prometheus.register.contentType });
    res.end(Prometheus.register.metrics());
  }).listen(port || 1338, '0.0.0.0');
}
