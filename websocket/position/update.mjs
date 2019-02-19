import GeoTracking from '../../models/geo-tracking';

export default (socket) => {
  socket.on('positionUpdate', async ({ user, campus, position }) => {
    await GeoTracking.pushHourlyTrack(user, campus, position);
    socket.broadcast.emit(
      'positionUpdate', {
        user,
        campus,
        position,
        date: new Date(),
      },
    );
  });
};
