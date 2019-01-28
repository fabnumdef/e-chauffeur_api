import GeoTracking from '../../models/geo-tracking';

export default (socket) => {
  socket.on('positionUpdate', ({ user, position }) => GeoTracking.pushHourlyTrack(user, position));
};
