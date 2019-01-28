import GeoTracking from '../../models/geo-tracking';

export default (socket) => {
  socket.on('positionUpdate', ({ user, campus, position }) => GeoTracking.pushHourlyTrack(user, campus, position));
};
