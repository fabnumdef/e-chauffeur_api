import GeoTracking from '../../models/geo-tracking';

export default (socket) => {
  socket.on('positionUpdate', async ({
    user, campus, position, rides = [],
  }) => {
    await GeoTracking.pushHourlyTrack(user, campus, position);
    let io = socket.in(`campus/${campus.id}`);
    if (rides && rides.length > 0) {
      rides.forEach((ride) => {
        io = io.in(`ride/${ride.id}`);
      });
    }
    io.emit(
      'positionUpdate', {
        user,
        campus,
        position,
        date: new Date(),
      },
    );
  });
};
