import camelCase from 'lodash.camelcase';
import lGet from 'lodash.get';
import { CANCELED_STATUSES, DELIVERED } from '../models/status';
import maskOutput, { cleanObject } from '../middlewares/mask-output';
import contentNegociation from '../middlewares/content-negociation';
import checkRights from '../middlewares/check-rights';
import generateCRUD from '../helpers/abstract-route';
import Ride from '../models/ride';
import { ensureThatFiltersExists } from '../middlewares/query-helper';
import {
  CAN_CREATE_RIDE,
  CAN_EDIT_RIDE,
  CAN_EDIT_RIDE_STATUS,
  CAN_GET_RIDE,
  CAN_GET_RIDE_POSITION,
  CAN_LIST_RIDE,
} from '../models/rights';

function ioEmit(ctx, data, eventName = '', rooms = []) {
  let { app: { io } } = ctx;
  rooms.forEach((room) => {
    io = io.in(room);
  });
  io.emit(eventName, data);
}

const router = generateCRUD(Ride, {
  create: {
    right: CAN_CREATE_RIDE,
    async main(ctx) {
      const { request: { body } } = ctx;
      const ride = await Ride.create(body);
      ctx.body = ride;
      ctx.log(ctx.log.INFO, `${Ride.modelName} "${ride.id}" has been created`);
      ioEmit(ctx, cleanObject(ctx.body), 'rideUpdate', [
        `ride/${ride.id}`,
        `campus/${ride.campus.id}`,
        `driver/${ride.driver.id}`,
      ]);
    },
  },
  update: {
    right: CAN_EDIT_RIDE,
    async main(ctx) {
      const { request: { body } } = ctx;

      const { params: { id } } = ctx;
      const ride = await Ride.findById(id);
      const previousDriverId = ride.driver.id.toString();

      ride.set(body);
      await ride.save();
      ctx.body = ride;
      ctx.log(
        ctx.log.INFO,
        `${Ride.modelName} "${id}" has been modified`,
        { body },
      );
      const rooms = [
        `ride/${ride.id}`,
        `campus/${ride.campus.id}`,
        `driver/${ride.driver.id}`,
      ];
      if (body.driver.id !== previousDriverId) {
        rooms.push(`driver/${previousDriverId}`);
      }
      ioEmit(ctx, cleanObject(ctx.body), 'rideUpdate', rooms);
    },
  },
  get: {
    right: CAN_GET_RIDE,
    async main(ctx) {
      const { params: { id }, query: { token } } = ctx;
      const ride = await Ride.findById(Ride.castId(id));

      if (!ride.isAccessibleByAnonymous(token)) {
        ctx.throw_and_log(401, `User not authorized to fetch the ride "${id}"`);
      }
      if (!ride) {
        ctx.throw_and_log(404, `${Ride.modelName} "${id}" not found`);
      }
      ctx.body = ride;
      ctx.log(
        ctx.log.INFO,
        `Find ${Ride.modelName} with "${id}"`,
      );
    },
  },
  list: {
    right: CAN_LIST_RIDE,
    filters: {
      campus: 'campus._id',
    },
    middlewares: [
      contentNegociation,
      maskOutput,
      async (ctx, next) => {
        await next();
        if (lGet(ctx, 'query.csv.flatten', '').toLowerCase() === 'true') {
          ctx.body = ctx.body.map(ride => ({
            ...ride,
            departure: {
              ...ride.departure,
              location: {
                longitude: lGet(ride, 'departure.location.coordinates.0', null),
                latitude: lGet(ride, 'departure.location.coordinates.1', null),
              },
            },
            arrival: {
              ...ride.arrival,
              location: {
                longitude: lGet(ride, 'arrival.location.coordinates.0', null),
                latitude: lGet(ride, 'arrival.location.coordinates.1', null),
              },
            },
            status: {
              latest: ride.status,
              ...ride
                .statusChanges
                .sort((a, b) => a.time.getTime() - b.time.getTime())
                .map(({ time, status }) => ({ [status]: time }))
                .reduce((row, acc) => Object.assign(acc, row), {}),
            },
          }));
        }
      },
      ensureThatFiltersExists('start', 'end'),
    ],
    async main(ctx) {
      // @todo: Add right on max
      const { offset, limit } = ctx.parseRangePagination(Ride, { max: 1000 });
      const start = new Date(ctx.query.filters.start);
      const end = new Date(ctx.query.filters.end);

      const total = await Ride.countDocumentsWithin(start, end, ctx.filters);
      const data = await Ride.findWithin(start, end, ctx.filters).skip(offset).limit(limit).lean();
      ctx.setRangePagination(Ride, {
        total, offset, count: data.length, limit,
      });

      ctx.body = data;
      ctx.log(
        ctx.log.INFO,
        `Find query in ${Ride.modelName}`,
        { filters: ctx.filters, offset, limit },
      );
    },
  },
});

/**
 * Rights :
 * - Il the user is not logged in, but token provided as a filter is the right one
 */
router.get(
  '/:id/position',
  checkRights(CAN_GET_RIDE_POSITION),
  maskOutput,
  async (ctx) => {
    const { params: { id }, query: { token } } = ctx;
    const ride = await Ride.findById(Ride.castId(id));

    if (!ride.isAccessibleByAnonymous(token)) {
      ctx.throw_and_log(401, `User not authorized to fetch the ride "${id}"`);
    }

    if (!ride) {
      ctx.throw_and_log(404, `${Ride.modelName} "${id}" not found`);
      return;
    }

    if (ride.status === DELIVERED || CANCELED_STATUSES.indexOf(ride.status) !== -1) {
      ctx.throw_and_log(417, `${Ride.modelName} "${id}" already delivered or cancelled`);
    }

    const position = await ride.findDriverPosition(new Date());
    if (!position) {
      ctx.status = 404;
      return;
    }

    ctx.body = position;
    ctx.log(
      ctx.log.INFO,
      `Find position of ${Ride.modelName} with "${id}"`,
    );
  },
);

router.post(
  '/:id/:action',
  checkRights(CAN_EDIT_RIDE_STATUS),
  maskOutput,
  async (ctx) => {
    // @todo: rights - driver should be able to update status

    const { params: { id, action } } = ctx;
    const ride = await Ride.findById(id);
    if (!ride) {
      ctx.throw_and_log(404, `${Ride.modelName} "${id}" not found`);
    }
    if (!ride.can(action)) {
      ctx.throw_and_log(400, `State violation : ride cannot switch to "${action}"`);
    }

    ride[camelCase(action)]();
    ctx.body = await ride.save();
    ctx.log(
      ctx.log.INFO,
      `${Ride.modelName} "${id}" has been modified`,
      { ride },
    );
    ioEmit(ctx, cleanObject(ctx.body), 'rideUpdate', [
      `ride/${ride.id}`,
      `campus/${ride.campus.id}`,
      `driver/${ride.driver.id}`,
    ]);
  },
);

export default router.routes();
