import lGet from 'lodash.get';

/**
 * @return {symbol}
 */
export const stdRule = id => ({
  id: Symbol(id),
  rule: () => true,
});

/**
 * @return {symbol}
 */
export const campusRule = id => ({
  id: Symbol(id),
  rule: ({ campuses = [] }, ctx) => {
    const campus = lGet(ctx, 'params.campus_id', null);
    return campus && !!campuses.find(c => c._id === campus);
  },
});
