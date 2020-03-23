import Campus from '../models/campus';

export const REQUESTABLE = {
  total: 'total',
  poisArrival: 'pois-arrival',
  poisDeparture: 'pois-departure',
  categories: 'categories',
  carModels: 'car-models',
  statuses: 'statuses',
  drivers: 'drivers',
  hasPhone: 'has-phone',
  period: 'period',
  uxGrade: 'uxGrade',
  recommendationGrade: 'recommendationGrade',
};

export default async (requested, options) => {
  const requestedStats = await Promise.all(requested.map(async (r) => {
    const {
      timeUnit, timeScope,
      campuses, start, end,
    } = options;

    let v = null;

    switch (r) {
      case REQUESTABLE.total:
        v = await Campus.countRides(campuses, start, end);
        break;
      case REQUESTABLE.poisArrival:
        v = await Campus.aggregateRidesByArrivalPOI(campuses, start, end);
        break;
      case REQUESTABLE.poisDeparture:
        v = await Campus.aggregateRidesByDeparturePOI(campuses, start, end);
        break;
      case REQUESTABLE.categories:
        v = await Campus.aggregateRidesByCategory(campuses, start, end);
        break;
      case REQUESTABLE.drivers:
        v = await Campus.aggregateRidesByDriver(campuses, start, end);
        break;
      case REQUESTABLE.carModels:
        v = await Campus.aggregateRidesByCarModel(campuses, start, end);
        break;
      case REQUESTABLE.statuses:
        v = await Campus.aggregateRidesByStatus(campuses, start, end);
        break;
      case REQUESTABLE.hasPhone:
        {
          const result = await Campus.aggregateRidesByPhonePresence(campuses, start, end);
          v = {
            true: (result.find(({ _id }) => _id === true) || {}).total || 0,
            false: (result.find(({ _id }) => _id === false) || {}).total || 0,
          };
        }
        break;
      case REQUESTABLE.period:
        {
          const results = await Campus.aggregateRidesOverTime(
            campuses,
            start,
            end,
            { timeUnit, timeScope },
          );
          if (timeUnit === 'day') {
            v = Array.from({ length: 7 }).map((_, index) => {
              const _id = index + 1;
              return results.find((row) => row._id === _id) || { _id };
            });
          } else if (timeUnit === 'month') {
            v = Array.from({ length: 12 }).map((_, index) => {
              const _id = index + 1;
              return results.find((row) => row._id === _id) || { _id };
            });
          } else if (timeUnit === 'hour') {
            v = Array.from({ length: 24 }).map((_, index) => {
              const _id = index;
              return results.find((row) => row._id === _id) || { _id };
            });
          } else {
            v = results;
          }
        }
        break;
      case REQUESTABLE.uxGrade:
        v = await Campus.aggregateRatingsByUXGrade(campuses, start, end);
        break;
      case REQUESTABLE.recommendationGrade:
        v = await Campus.aggregateRatingsByRecommendationGrade(campuses, start, end);
        break;
      default:
    }

    return { [r]: v };
  }));
  return requestedStats.reduce((acc, curr) => Object.assign(acc, curr), {});
};
