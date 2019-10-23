import http from 'http';
import socketIo from 'socket.io';
import redisAdapter from 'socket.io-redis';
import services from './services';
import app from './app';
import io from './io';
import config from './services/config';

(async () => {
  await services;
  const server = http.createServer(app.callback());
  app.io = socketIo(server);
  const redisConfig = config.get('redis');
  if (redisConfig && redisConfig.host) {
    app.io.adapter(redisAdapter(redisConfig));
  }
  io(app.io);
  server.listen(config.get('port') || 1337);
})();
