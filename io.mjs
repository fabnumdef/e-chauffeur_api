import joinRoom from './websocket/room/join';
import positionUpdate from './websocket/position/update';

export default (io) => {
  io.on('connection', (socket) => {
    joinRoom(socket);
    positionUpdate(socket);
  });
};
