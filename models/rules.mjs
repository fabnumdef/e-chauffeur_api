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

/**
 * @return {symbol}
 */
export const selfEditingUserRule = id => ({
  id: Symbol(id),
  rule: (_, ctx) => {
    const userParam = lGet(ctx, 'params.user_id', null);
    const loggedUser = lGet(ctx, 'state.user.id', null);
    return userParam && loggedUser && userParam === loggedUser;
  },
});
