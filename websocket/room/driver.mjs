export default (socket) => {
  socket.on('roomJoinDriver', ({ user: { id: user }, campus: { id: campus } }) => {
    // @todo: get campus
    // @todo: compute campus drivers
    // @todo: test if user is a driver
    socket.join({ room: 'campus', campus });
    socket.join({ room: 'driver', campus, user });
  });

  socket.on('roomLeaveDriver', ({ user: { id: user }, campus: { id: campus } }) => {
    socket.leave({ room: 'campus', campus });
    socket.leave({ room: 'driver', campus, user });
  });

  socket.on('roomLeaveAll', () => {
    socket.leaveAll();
  });
};
