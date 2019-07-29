import lGet from 'lodash.get';
// eslint-disable-next-line import/no-cycle
import { CAN_LIST_ALL_CAMPUSES } from './rights';

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
    if (ctx.may(CAN_LIST_ALL_CAMPUSES)) {
      return true;
    }
    const campus = lGet(ctx, 'params.campus_id', lGet(ctx, 'query.filters.campus', null));
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

export const roleEditingRule = id => ({
  id: Symbol(id),
  rule: ({ campuses = [] }, ctx, { id: campusId = null } = {}) => campusId && !!campuses.find(c => c._id === campusId),
});
