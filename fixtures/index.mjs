/* eslint-disable no-useless-escape */
import util from 'util';
import fs from 'fs';
import path from 'path';
import mongoose from 'mongoose';

const { promisify } = util;
const readDir = promisify(fs.readdir);
const readFile = promisify(fs.readFile);

const FILENAME = typeof __filename !== 'undefined' ? __filename
  : (/^ +at (?:file:\/*(?=\/)|)(.*?):\d+:\d+$/m.exec(Error().stack) || '')[1];
const DIRNAME = typeof __dirname !== 'undefined' ? __dirname
  : FILENAME.replace(/[\/\\][^\/\\]*?$/, '');

const CURRENT_FILE = path.basename(FILENAME);

(async () => {
  await import('../services');
  await import('../models/role.mjs');

  await Promise.all((await readDir(DIRNAME))
    .filter((f) => f !== CURRENT_FILE)
    .map(async (jsonFileName) => {
      const filename = path.basename(jsonFileName, '.json');
      const file = `../models/${filename}.mjs`;
      const { default: Model } = await import(file);
      const data = JSON.parse(await readFile(path.resolve(DIRNAME, `./${jsonFileName}`), 'utf8'));
      await Promise.all(data.map(async (datum) => {
        const d = new Model(datum);
        await d.save();
      }));
    }));
  mongoose.connection.close();
})();
