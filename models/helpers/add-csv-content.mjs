const validateDatas = async ({
  model: Model, refs, datas,
}) => {
  await Promise.all(datas.map((data) => {
    const model = new Model(data);
    return model.validate((err) => {
      if (err) {
        // eslint-disable-next-line no-param-reassign
        err.message = `${err.message} Data : ${refs[0]} = ${data[refs[0]]}`;
        throw err;
      }
    });
  }));
};

const checkDuplications = async ({
  model: Model, refs = [], datas,
}) => {
  // check duplications in batch
  const batchDuplications = refs.reduce((acc, r) => {
    const refData = datas.map((data) => data[r]);
    return [
      ...acc,
      ...refData.reduce((a, d) => {
        const counter = refData.reduce((count, current) => (current === d ? count + 1 : count), 0);
        if (counter > 1 && !a.find((item) => item === `${r} : ${d}`)) {
          a.push(`${r} : ${d}`);
        }
        return a;
      }, []),
    ];
  }, []);

  if (batchDuplications.length > 0) {
    const err = new Error();
    err.status = 422;
    err.message = `Duplications in the batch : ${batchDuplications}`;
    throw err;
  }

  const documents = await Model.find().lean();
  // check potential duplications in db
  const dbDuplications = datas.reduce((acc, data) => ([
    ...acc,
    ...refs.reduce((a, r) => {
      const counter = documents.reduce((count, document) => (data[r] === document[r] ? count + 1 : count), 0);
      if (counter > 0 && !a.find((item) => item === `${r} : ${data[r]}`)) {
        a.push(`${r} : ${data[r]}`);
      }
      return a;
    }, []),
  ]), []);

  if (dbDuplications.length > 0) {
    const err = new Error();
    err.status = 422;
    err.message = `Duplications with database : ${dbDuplications}`;
    throw err;
  }
};

export default function addCSVContentPlugin(schema) {
  // eslint-disable-next-line no-param-reassign
  schema.statics.createFromCSV = async function createFromCSV(args) {
    await checkDuplications(args);
    await validateDatas(args);

    const { model: Model, datas } = args;
    await Promise.all(datas.map((data) => Model.create(data)));
  };
}
