import config from './config';
import MongooseService from './mongoose';

export default Promise.all([
  MongooseService(config.get('mongodb')),
]);
