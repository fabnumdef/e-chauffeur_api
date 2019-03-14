import Json2csv from 'json2csv';

export default async (ctx, next) => {
  await next();
  switch (ctx.headers.accept) {
    case 'text/csv':
      {
        const Json2csvParser = Json2csv.Parser;
        const parser = new Json2csvParser({ flatten: true });
        ctx.type = 'text/csv';
        ctx.body = parser.parse(ctx.body);
      }
      break;
    default:
  }
};
