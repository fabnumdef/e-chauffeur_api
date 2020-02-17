import http from 'http';
import socketIo from 'socket.io';
import redisAdapter from 'socket.io-redis';
import services from './services';
import app from './app';
import './prometheus-exporter';
import io from './io';
import config from './services/config';
import { pubClient, subClient } from './services/redis';

(async () => {
  await services;
  const server = http.createServer(app.callback());

  app.io = socketIo(server, {
    serveClient: false,
    cookie: false,
    adapter: (pubClient && subClient) ? redisAdapter({ pubClient, subClient }) : undefined,
  });
  io(app.io);
  server.listen(config.get('port') || 1337);
})();
