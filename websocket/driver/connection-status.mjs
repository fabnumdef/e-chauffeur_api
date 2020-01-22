export default (socket) => {
  socket.on('registerCampus', (campusId) => {
    // eslint-disable-next-line no-param-reassign
    socket.campusId = campusId;
  });
  socket.on('disconnect', () => {
    const io = socket.in(`campus/${socket.campusId}`);
    io.emit('updateConnectedDrivers', { ids: socket.driverId, connected: false });
  });
};
