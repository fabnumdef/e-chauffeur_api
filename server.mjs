import http from 'http';
import socketIo from 'socket.io';
import services from './services';
import app from './app';
import io from './io';

(async () => {
  await services;
  const server = http.createServer(app.callback());
  app.io = socketIo(server);
  io(app.io);
  server.listen(1337);
})();
