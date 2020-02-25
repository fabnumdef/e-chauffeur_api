import Router from '@koa/router';
import users from './users';
import pois from './pois';
import logs from './logs';
import cars from './cars';
import categories from './categories';
import rides from './rides';
import carModels from './car-models';
import jwt from './jwt';
import campus from './campuses';
import feedback from './feedback';
import forms from './forms';
import phones from './phones';
import phoneModels from './phone-models';
import timeSlots from './time-slots';
import config from '../services/config';
import ratings from './ratings';

const router = new Router();

router.get('/', (ctx) => {
  ctx.body = `OK - ${config.get('version')}`;
});

router.use('/campuses', campus.routes());
router.use('/campuses', campus.allowedMethods());
router.use('/car-models', carModels.routes());
router.use('/car-models', carModels.allowedMethods());
router.use('/cars', cars.routes());
router.use('/cars', cars.allowedMethods());
router.use('/categories', categories.routes());
router.use('/categories', categories.allowedMethods());
router.use('/feedback', feedback.routes());
router.use('/feedback', feedback.allowedMethods());
router.use('/forms', forms.routes());
router.use('/forms', forms.allowedMethods());
router.use('/jwt', jwt.routes());
router.use('/jwt', jwt.allowedMethods());
router.use('/logs', logs.routes());
router.use('/logs', logs.allowedMethods());
router.use('/phone-models', phoneModels.routes());
router.use('/phone-models', phoneModels.allowedMethods());
router.use('/phones', phones.routes());
router.use('/phones', phones.allowedMethods());
router.use('/pois', pois.routes());
router.use('/pois', pois.allowedMethods());
router.use('/ratings', ratings.routes());
router.use('/ratings', ratings.allowedMethods());
router.use('/rides', rides.routes());
router.use('/rides', rides.allowedMethods());
router.use('/time-slots', timeSlots.routes());
router.use('/time-slots', timeSlots.allowedMethods());
router.use('/users', users.routes());
router.use('/users', users.allowedMethods());

export default router;
