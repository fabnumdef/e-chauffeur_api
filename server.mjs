import http from 'http';
import socketIo from 'socket.io';
import services from './services';
import app from './app';
import io from './io';
import config from './services/config';

(async () => {
  await services;
  const server = http.createServer(app.callback());
  app.io = socketIo(server);
  io(app.io);
  server.listen(config.get('port') || 1337);
})();
