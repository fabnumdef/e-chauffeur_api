import joinRoom from './websocket/room/join';
import positionUpdate from './websocket/driver/position-update';
import driverStatus from './websocket/driver/connection-status';

export default (io) => {
  io.on('connection', (socket) => {
    joinRoom(socket);
    positionUpdate(socket);
    driverStatus(socket);
  });
};
