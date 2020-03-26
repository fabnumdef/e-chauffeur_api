export default async (ctx, next) => {
  ctx.throw_and_log = (code, message) => {
    ctx.log.error(message);
    ctx.throw(code, typeof message === 'object' && !message.message ? JSON.stringify(message) : message);
  };

  await next();
};
