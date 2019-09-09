import Ride from '../models/ride';

const PREFETCH_RIDE_KEY = Symbol('prefetched-ride');
export const getPrefetchedRide = (ctx, id) => ctx.state[PREFETCH_RIDE_KEY][id];
export const prefetchRideMiddleware = (getId = (ctx) => ctx.params.id) => async (ctx, next) => {
  const rideId = getId(ctx);
  ctx.state[PREFETCH_RIDE_KEY] = ctx.state[PREFETCH_RIDE_KEY] || {};
  ctx.state[PREFETCH_RIDE_KEY][rideId] = await Ride.findById(Ride.castId(rideId));
  await next();
};
