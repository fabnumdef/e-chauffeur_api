import jwt from 'jsonwebtoken';
import config from '../../services/config';
import Ride from '../../models/ride';

export default (socket) => {
  socket.on('roomJoinDriver', async (token) => {
    const user = jwt.verify(token.replace('Bearer ', ''), config.get('token:secret'));
    if (user.id) {
      socket.join(`driver/${user.id}`);
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
      if (rde.token === ride.token) {
        socket.join(`ride/${ride.id}`);
      }
    }
  });

  socket.on('roomLeaveAll', () => {
    socket.leaveAll();
  });
};
