export const emitDriversSocketConnected = async (ctx, next) => {
  if (ctx.query.filters && ctx.query.filters.start) {
    const { app: { io }, params: { campus_id: campusId } } = ctx;
    const connectedDrivers = [];
    await Promise.all(ctx.body.map((driver) => new Promise((resolve) => {
      io.in(`driver/${driver._id}`)
        .clients((err, clients) => {
          if (clients.length === 1) {
            const { driverId } = io.sockets.sockets[clients[0]];
            connectedDrivers.push(driverId);
          }
          resolve();
        });
    })));
    io.in(`campus/${campusId}`)
      .emit('updateConnectedDrivers', { ids: connectedDrivers });
  }
  await next();
};

export const emitDriverConnection = async (ctx, next) => {
  await next();
  const { user } = ctx.state;
  const { id: campusId } = ctx.params;
  const { io } = ctx.app;
  const isDriver = user.roles.reduce((acc, { role, campuses }) => (
    acc || (role === 'ROLE_DRIVER' && !!campuses.find((campus) => campus._id === campusId))
  ), false);

  if (isDriver) {
    io.to(`campus/${campusId}`).emit('updateConnectedDrivers', { ids: user.id });
  }
};
