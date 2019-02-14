import joinDriverRoom from './websocket/room/driver';
import positionUpdate from './websocket/position/update';

export default (io) => {
  io.on('connection', (socket) => {
    joinDriverRoom(socket);
    positionUpdate(socket);
  });
};
