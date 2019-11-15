import Ride from '../models/ride';

// eslint-disable-next-line import/prefer-default-export
export const ensureThatFiltersExists = (...requiredFilters) => async (ctx, next) => {
  ctx.assert(ctx.query, 400, 'No query string found');
  const { filters } = ctx.query;
  ctx.assert(filters, 400, '"filters" not found in query string');
  requiredFilters.forEach((key) => ctx.assert(filters[key], 400, `"${key}" filter is required`));
  await next();
};
export const filtersToObject = (...filtersToParse) => async (ctx, next) => {
  ctx.assert(ctx.query, 400, 'No query string found');
  const { filters } = ctx.query;
  ctx.assert(filters, 400, '"filters" not found in query string');
  filtersToParse.forEach((key) => { if (filters[key]) ctx.filters[key] = JSON.parse(filters[key]); });
  await next();
};

export const formatFilters = async (ctx, next) => {
  const filters = Object.keys(ctx.request.query.filters).map((key) => ({ [key]: ctx.request.query.filters[key] }));
  let alreadySet = false;

  const queryFilter = filters.reduce((acc, current) => {
    let newAcc;
    const key = Object.keys(current).join('');

    switch (key) {
      case 'userId':
        newAcc = {
          $and: [
            ...acc.$and,
            {
              'owner._id': current.userId,
            },
          ],
        };
        break;
      // fall-through on purpose
      // eslint-disable-next-line no-fallthrough
      case 'start':
      case 'end': {
        const startAndEnd = filters
          .filter((filter) => (filter.start || filter.end));
        if (startAndEnd.length < 2) {
          ctx.throw_and_log(404, 'Start and end not found');
        }
        if (alreadySet) {
          return acc;
        }

        alreadySet = true;
        newAcc = {
          $and: [
            ...acc.$and,
            {
              ...Ride.filtersWithin(
                startAndEnd.find((obj) => obj.start).start,
                startAndEnd.find((obj) => obj.end).end,
              ),
            },
          ],
        };
        break;
      }
      case 'current':
        newAcc = {
          $and: [
            ...acc.$and,
            {
              $nor: {
                status: 'delivered',
              },
            },
          ],
        };
        break;
      default:
        newAcc = {
          $and: [
            ...acc.$and,
            {
              ...current,
            },
          ],
        };
    }
    return newAcc;
  }, { $and: [] });

  ctx.filters = queryFilter;
  await next();
};
