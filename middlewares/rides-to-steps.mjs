import { sortByDate } from '../helpers/date-helpers';
import convertRideToSteps from '../helpers/step-management/generator';
import mergeSimilarSteps from '../helpers/step-management/merge';

export default async (ctx, next) => {
  await next();
  if (ctx.query.filters && ctx.query.filters.format === 'steps') {
    const sortedSteps = sortByDate(ctx.body.reduce((acc, ride) => [
      ...acc,
      ...convertRideToSteps(ride),
    ], []));
    ctx.body = mergeSimilarSteps(sortedSteps);
  }
};
