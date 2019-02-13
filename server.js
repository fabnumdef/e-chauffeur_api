const http = require('http');
const socketIo = require('socket.io');

(async () => {
  await import('./services');
  const { default: app } = await import('./app.mjs');
  const { default: io } = await import('./io.mjs');
  const server = http.createServer(app.callback());
  app.io = socketIo(server);
  io(app.io);
  server.listen(1337);
})();
