import { cleanObject } from './mask-output';

export function ioEmit(ctx, data, eventName = '', rooms = []) {
  let { app: { io } } = ctx;
  rooms.forEach((room) => {
    io = io.in(room);
  });
  io.emit(eventName, data);
}

export default (eventName, roomTypes) => async (ctx, next) => {
  await next();
  const { body } = ctx;
  const rooms = roomTypes.reduce((acc, type) => {
    if (['ride', 'shuttle'].includes(type)) {
      acc.push(`${type}/${body.id}`);
    } else if (body[type] && body[type].id) {
      acc.push(`${type}/${body[type].id}`);
    }
    return acc;
  }, []);

  ioEmit(ctx, cleanObject(ctx.body), eventName, rooms);
};
