import path from 'path';
import nconf from 'nconf';

nconf.argv()
  .env({
    separator: '__',
    lowerCase: true,
  })
  .file({
    file: path.join(path.dirname(new URL(import.meta.url).pathname), '..', 'config.json'),
  });

export default nconf;
