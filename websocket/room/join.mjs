import jwt from 'jsonwebtoken';
import config from '../../services/config';

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
    if (ride.id) {
      socket.join(`ride/${ride.id}`);
    }
  });

  socket.on('roomLeaveAll', () => {
    socket.leaveAll();
  });
};
