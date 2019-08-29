import Router from 'koa-router';
import users from './users';
import pois from './pois';
import logs from './logs';
import cars from './cars';
import categories from './categories';
import rides from './rides';
import carModels from './car-models';
import carEvents from './car-events';
import userEvents from './user-events';
import jwt from './jwt';
import campus from './campuses';
import feedback from './feedback';
import forms from './forms';
import phones from './phones';
import phoneModels from './phone-models';
import config from '../services/config';

const router = new Router();

router.get('/', (ctx) => {
  ctx.body = `OK - ${config.get('version')}`;
});

router.use('/users', users);
router.use('/pois', pois);
router.use('/logs', logs);
router.use('/cars', cars);
router.use('/categories', categories);
router.use('/rides', rides);
router.use('/car-models', carModels);
router.use('/car-events', carEvents);
router.use('/user-events', userEvents);
router.use('/jwt', jwt);
router.use('/campuses', campus);
router.use('/feedback', feedback);
router.use('/forms', forms);
router.use('/phones', phones);
router.use('/phone-models', phoneModels);

export default router.routes();
