import csv2Json from 'csvtojson';

export const checkDuplications = (Model, ref) => async (ctx, next) => {
  const documents = await Model.find().lean();
  const duplications = documents.filter((document) => {
    // eslint-disable-next-line consistent-return
    ctx.file.forEach((data) => {
      if (data[ref] === document[ref]) {
        return true;
      }
    });
    return false;
  });

  if (duplications.length > 0) {
    ctx.throw_and_log(422, 'Duplications in the batch');
  }
  await next();
};

export const csvToJson = async (ctx, next) => {
  const { body: { delimiter = ';', ignoreEmpty = true }, files } = ctx.request;

  const { length, 0: file } = Object.keys(files).map((key) => files[key]);
  if (length > 1) {
    ctx.throw_and_log(422, 'Please send one file at a time');
  }

  ctx.file = await csv2Json({ delimiter, ignoreEmpty }).fromFile(file.path);
  await next();
};
