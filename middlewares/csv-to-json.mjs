import csv2Json from 'csvtojson';
import Campus from '../models/campus';

export const validateCampus = async (ctx, next) => {
  const { file, query } = ctx;
  if (query && query.filters && query.filters.campus) {
    const { campus } = query.filters;
    const campusDocument = await Campus.findById(campus).lean();
    ctx.file = file.map((item) => {
      const newItem = { ...item };
      if (!item.campus) {
        newItem.campus = {
          id: campusDocument.id,
          name: campusDocument.name,
        };
      } else if (item.campus.id !== campusDocument._id && item.campus.name !== campusDocument.name) {
        ctx.throw_and_log(403, 'Campus does not match current one');
      }
      return newItem;
    });
  }
  await next();
};

export const csvToJson = async (ctx, next) => {
  const { query: { delimiter = ';', ignoreEmpty = true }, files } = ctx.request;
  const { length, 0: file } = Object.keys(files).map((key) => files[key]);
  if (length > 1) {
    ctx.throw_and_log(400, 'Please send one file at a time');
  }

  ctx.file = await csv2Json({ delimiter, ignoreEmpty }).fromFile(file.path);
  ctx.file = ctx.file.map((d) => {
    const data = { ...d };
    if (d.id && !d.email) {
      data._id = d.id;
      delete data.id;
    }
    return data;
  });
  await next();
};
