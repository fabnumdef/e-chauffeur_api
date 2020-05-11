import Router from '@koa/router';
import config from '../services/config';
// sorted alphabetically
import campus from './campuses';
import carModels from './car-models';
import cars from './cars';
import categories from './categories';
import feedback from './feedback';
import forms from './forms';
import jwt from './jwt';
import logs from './logs';
import phoneModels from './phone-models';
import phones from './phones';
import pois from './pois';
import ratings from './ratings';
import rides from './rides';
import shuttleFactory from './shuttle-factories';
import shuttles from './shuttles';
import stats from './stats';
import users from './users';

const router = new Router();

router.get('/', (ctx) => {
  ctx.body = `OK - ${config.get('version')}`;
});

// sorted alphabetically
router.use('/campuses', campus.allowedMethods());
router.use('/campuses', campus.routes());
router.use('/car-models', carModels.allowedMethods());
router.use('/car-models', carModels.routes());
router.use('/cars', cars.allowedMethods());
router.use('/cars', cars.routes());
router.use('/categories', categories.allowedMethods());
router.use('/categories', categories.routes());
router.use('/feedback', feedback.allowedMethods());
router.use('/feedback', feedback.routes());
router.use('/forms', forms.allowedMethods());
router.use('/forms', forms.routes());
router.use('/jwt', jwt.allowedMethods());
router.use('/jwt', jwt.routes());
router.use('/logs', logs.allowedMethods());
router.use('/logs', logs.routes());
router.use('/phone-models', phoneModels.allowedMethods());
router.use('/phone-models', phoneModels.routes());
router.use('/phones', phones.allowedMethods());
router.use('/phones', phones.routes());
router.use('/pois', pois.allowedMethods());
router.use('/pois', pois.routes());
router.use('/ratings', ratings.allowedMethods());
router.use('/ratings', ratings.routes());
router.use('/rides', rides.allowedMethods());
router.use('/rides', rides.routes());
router.use('/shuttle-factories', shuttleFactory.allowedMethods());
router.use('/shuttle-factories', shuttleFactory.routes());
router.use('/shuttles', shuttles.allowedMethods());
router.use('/shuttles', shuttles.routes());
router.use('/stats', stats.allowedMethods());
router.use('/stats', stats.routes());
router.use('/users', users.allowedMethods());
router.use('/users', users.routes());

export default router;
