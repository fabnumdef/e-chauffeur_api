import path from 'path';

export default (fileName) => ['csv-file', path.join(process.env.PWD, 'tests/helpers/batch', `${fileName}.csv`)];
