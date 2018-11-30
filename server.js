const http = require('http');
const socketIo = require('socket.io');

(async () => {
  await import('./services');
  const { default: app } = await import('./app.mjs');
  const { default: io } = await import('./io.mjs');
  const server = http.createServer(app.callback());
  io(socketIo(server));
  server.listen(1337);
})();
