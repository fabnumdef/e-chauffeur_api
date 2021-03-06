import lGet from 'lodash.get';
import lXor from 'lodash.xor';
import nanoid from 'nanoid';
import mongoose from 'mongoose';
// It's not really a cycle import, we're not importing the same part of the tree
// eslint-disable-next-line import/no-cycle
import { CAN_LIST_ALL_CAMPUSES } from './rights';
// eslint-disable-next-line import/no-cycle
import * as roles from './role';
import { getPrefetchedDocument } from '../helpers/prefetch-document';

function getModelNameFromURL(url) {
  return url.includes('shuttles') ? 'Shuttle' : 'Ride';
}

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
  let userParam = lGet(ctx, 'params.user_id', null);
  if (!userParam) {
    userParam = lGet(ctx.request, 'query.filters.userId', null);
  }
  const loggedUser = lGet(ctx, 'state.user.id', null);
  return userParam && loggedUser && userParam === loggedUser;
});

export const roleEditingRule = ruleGenerator((
  { campuses = [] },
  ctx,
  { id: campusId = null } = {},
) => campusId && !!campuses.find((c) => c._id === campusId));

export const tokenRideRule = ruleGenerator((_, ctx) => {
  const Model = mongoose.model(getModelNameFromURL(ctx.url));
  const ride = getPrefetchedDocument.call(ctx, ctx.params.id, Model);
  return ride.token === ctx.query.token;
});

export const ownedRideRule = ruleGenerator((_, ctx, entity) => {
  const { user } = ctx.state;
  const Model = mongoose.model(getModelNameFromURL(ctx.url));
  const ride = entity || getPrefetchedDocument.call(ctx, ctx.params.id, Model);
  return ride.owner && ride.owner.id && ride.owner.id.toString() === user.id;
});

export const onlyLowerRightsRule = ruleGenerator((_, ctx, userToEdit) => {
  const { user } = ctx.state;
  return user.roles.reduce(
    (acc, { campuses = [], role }) => acc && userToEdit.roles.map(
      (u) => lXor(campuses, u.campuses).length <= 0 && roles[role].hasRoleInInheritance(u.role),
    ),
    true,
  );
});
