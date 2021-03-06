import jwt from 'jsonwebtoken';
import config from '../../services/config';
import Ride from '../../models/ride';
import { CANCELED_STATUSES, DELIVERED } from '../../models/status';

export default (socket) => {
  socket.on('roomJoinDriver', async (token) => {
    const user = jwt.verify(token.replace('Bearer ', ''), config.get('token:secret'));
    if (user.id) {
      socket.join(`driver/${user.id}`);
      // eslint-disable-next-line no-param-reassign
      socket.driverId = user.id;
    }
  });

  socket.on('roomJoinAdmin', async (token, campus = {}) => {
    jwt.verify(token.replace('Bearer ', ''), config.get('token:secret'));
    if (campus.id) {
      socket.join(`campus/${campus.id}`);
    }
  });

  socket.on('roomJoinRide', async (ride) => {
    if (ride.id && ride.token) {
      const rde = await Ride.findById(Ride.castId(ride.id));
      if (rde.token === ride.token && rde.status !== DELIVERED && CANCELED_STATUSES.indexOf(rde.status) === -1) {
        socket.join(`ride/${ride.id}`);
      }
    }
  });

  socket.on('roomLeaveAll', () => {
    socket.leaveAll();
  });
};
