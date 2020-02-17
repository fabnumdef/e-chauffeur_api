export default (socket) => {
  socket.on('driverConnected', ({ campusId, driverId }) => {
    // eslint-disable-next-line no-param-reassign
    socket.driverId = driverId;
    // eslint-disable-next-line no-param-reassign
    socket.campusId = campusId;

    const room = socket.in(`campus/${campusId}`);
    room.emit('updateConnectedDrivers', { ids: driverId });
  });
  socket.on('disconnect', () => {
    if (socket.driverId && socket.campusId) {
      const room = socket.in(`campus/${socket.campusId}`);
      room.emit('updateConnectedDrivers', { ids: socket.driverId, connected: false });
    }
  });
};
