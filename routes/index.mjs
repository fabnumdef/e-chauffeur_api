import Router from 'koa-router';
import users from './users';
import pois from './pois';
import roles from './roles';
import rights from './rights';
import cars from './cars';
import categories from './categories';
import rides from './rides';
import carModels from './car-models';
import carEvents from './car-events';
import userEvents from './user-events';
import jwt from './jwt';
import campus from './campuses';
import feedback from './feedback';

const router = new Router();

router.use('/users', users);
router.use('/pois', pois);
router.use('/roles', roles);
router.use('/rights', rights);
router.use('/cars', cars);
router.use('/categories', categories);
router.use('/rides', rides);
router.use('/car-models', carModels);
router.use('/car-events', carEvents);
router.use('/user-events', userEvents);
router.use('/jwt', jwt);
router.use('/campuses', campus);
router.use('/feedback', feedback);

export default router.routes();
