const { promisify } = require('util');
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');

const readDir = promisify(fs.readdir);

const CURRENT_FILE = path.basename(__filename);
const modelsPath = path.join(__dirname, '..', 'models');

(async () => {
  await import('../services');

  await Promise.all((await readDir(modelsPath)).map(async f => import(`../models/${f}`)));

  await Promise.all((await readDir(__dirname))
    .filter(f => f !== CURRENT_FILE)
    .map(async (file) => {
      const { default: Model } = await import(`../models/${file.replace(/\.json|.js/, '')}.mjs`);
      const data = require(`./${file}`); // eslint-disable-line
      await Promise.all(data.map(async (datum) => {
        const d = new Model(datum);
        await d.save();
      }));
    }));
  mongoose.connection.close();
})();
