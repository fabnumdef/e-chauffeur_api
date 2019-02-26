import config from './config';
import MongooseService from './mongoose';
import './luxon';

export default Promise.all([
  MongooseService(config.get('mongodb')),
]);
