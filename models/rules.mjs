import lGet from 'lodash.get';
import nanoid from 'nanoid';
// It's not really a cycle import, we're not importing the same part of the tree
// eslint-disable-next-line import/no-cycle
import { CAN_LIST_ALL_CAMPUSES } from './rights';

const ruleGenerator = (rule = () => true) => (id) => ({ id: Symbol(id || nanoid()), rule });
/**
 * @return {symbol}
 */
export const stdRule = ruleGenerator();

/**
 * @return {symbol}
 */
export const campusRule = ruleGenerator(({ campuses = [] }, ctx) => {
  if (ctx.may(CAN_LIST_ALL_CAMPUSES)) {
    return true;
  }
  const campus = lGet(ctx, 'params.campus_id', lGet(ctx, 'query.filters.campus', null));
  return campus && !!campuses.find((c) => c._id === campus);
});

/**
 * @return {symbol}
 */
export const selfEditingUserRule = ruleGenerator((_, ctx) => {
  const userParam = lGet(ctx, 'params.user_id', null);
  const loggedUser = lGet(ctx, 'state.user.id', null);
  return userParam && loggedUser && userParam === loggedUser;
});

export const roleEditingRule = ruleGenerator((
  { campuses = [] },
  ctx,
  { id: campusId = null } = {},
) => campusId && !!campuses.find((c) => c._id === campusId));
