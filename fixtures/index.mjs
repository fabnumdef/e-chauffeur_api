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
const modelsPath = path.join(DIRNAME, '..', 'models');


(async () => {
  await import('../services');

  await Promise.all((await readDir(modelsPath)).map(async f => import(`../models/${f}`)));
  await Promise.all((await readDir(DIRNAME))
    .filter(f => f !== CURRENT_FILE && f !== 'index.js')
    .map(async (file) => {
      const { default: Model } = await import(`../models/${file.replace(/\.json|.js/, '')}.mjs`);
      const data = JSON.parse(await readFile(path.resolve(DIRNAME, `./${file}`), 'utf8'));
      await Promise.all(data.map(async (datum) => {
        const d = new Model(datum);
        await d.save();
      }));
    }));
  mongoose.connection.close();
})();
