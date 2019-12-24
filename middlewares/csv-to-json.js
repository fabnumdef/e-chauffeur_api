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
  const { length, 0: file } = Object.keys(ctx.request.files).map((key) => ctx.request.files[key]);
  if (length > 1) {
    ctx.throw_and_log(422, 'Please send one file at a time');
  }

  const jsonFile = await csv2Json().fromFile(file.path);

  /*
   * format jsonFile
   * from { 'colA;colB;colC': '1;2;3' }
   * to { colA: 1, colB: 2, colC: 3 }
   * Delete empty key-value pair
   */
  ctx.file = jsonFile.reduce((acc, row) => {
    const [key] = Object.keys(row);
    const columns = key.split(';');
    const values = row[key].split(';');
    return [
      ...acc,
      columns.reduce((a, header, index) => {
        if (values[index]) {
          return {
            ...a,
            [header.toLowerCase()]: values[index],
          };
        }
        return a;
      }, {}),
    ];
  }, []);

  await next();
};
