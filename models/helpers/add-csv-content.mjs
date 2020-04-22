import APIError from '../../helpers/api-error';

const validateDatas = async ({
  model: Model, refs, datas,
}) => {
  await Promise.all(datas.map((data) => {
    const model = new Model(data);
    return model.validate((err) => {
      if (err) {
        // @todo: Maybe it will conflict new error formating.
        // eslint-disable-next-line no-param-reassign
        err.message = `${err.message} Data : ${refs[0]} = ${data[refs[0]]}`;
        throw err;
      }
    });
  }));
};

const checkDuplications = async ({
  model: Model, refs = ['_id'], datas,
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

  const dbDuplicatedDocuments = await Model.find({
    $or: refs.map((ref) => ({ [ref]: { $in: datas.map((d) => d[ref]) } })),
  }).lean();
  if (dbDuplicatedDocuments.length > 0) {
    throw (new APIError(422, 'import.db_duplications'))
      .addErrors(
        dbDuplicatedDocuments.map((doc) => ['import.error_on_document_id', { id: doc._id }]),
      );
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
