/* eslint-disable no-useless-escape */
import util from 'util';
import fs from 'fs';
import path from 'path';
import mongoose from 'mongoose';

const { promisify } = util;
const readDir = promisify(fs.readdir);

const FILENAME = typeof __filename !== 'undefined' ? __filename
  : (/^ +at (?:file:\/*(?=\/)|)(.*?):\d+:\d+$/m.exec(Error().stack) || '')[1];
const DIRNAME = typeof __dirname !== 'undefined' ? __dirname
  : FILENAME.replace(/[\/\\][^\/\\]*?$/, '');

(async () => {
  await import('./services');
  await import('./models/role.mjs');

  await Promise.all((await readDir(path.join(DIRNAME, 'models')))
    .filter((fileName) => fileName.endsWith('.mjs'))
    .filter((fileName) => !['rights.mjs', 'role.mjs', 'status.mjs', 'rules.mjs'].includes(fileName))
    .map(async (fileName) => {
      const { default: Model } = await import(path.join(DIRNAME, 'models', fileName));
      await Model.syncIndexes();
      console.log(`Indexes of "${Model.modelName}" has been updated`);
    }));
  await mongoose.connection.close();
})();
