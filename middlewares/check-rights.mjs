import * as roles from '../models/role';

export function userRights(user, rights, campus) {
  return rights.reduce(
    (acc, right) => acc || user.roles.reduce(
      (ruleAcc, ruleRow) => ruleAcc || (
        (roles[ruleRow.role] || []).find(
          r => right === r,
        )
        && (
          !campus || ruleRow.campuses.find(
            c => c._id === campus,
          )
        )
      ),
      false,
    ),
    false,
  );
}

export function anonymousRights(rights) {
  return rights.reduce(
    (acc, right) => acc || roles.ROLE_ANONYMOUS.find(
      r => right === r,
    ),
    false,
  );
}

const checkRights = (cps, ...rights) => async (ctx, next) => {
  const { user } = ctx.state;
  let campus = cps;
  if (campus) {
    if (!ctx.params.campus_id) {
      throw new Error('campus_id required in params');
    }
    campus = ctx.params.campus_id;
  }
  if (user) {
    if (!userRights(user, rights, campus)) {
      throw new Error('Current user not authorized to do this');
    }
  } else if (!anonymousRights(rights)) {
    throw new Error('Anonymous user not authorized to do this');
  }
  await next();
};

export default (...rights) => checkRights(false, ...rights);
export const checkCampusRights = (...rights) => checkRights(true, ...rights);

export const checkRightsOrLocalRights = (rights, localRights) => async (ctx, next) => {
  const { user } = ctx.state;
  let campus = true;
  if (ctx.params.campus_id) {
    campus = ctx.params.campus_id;
  } else if (ctx.query.filters && ctx.query.filters.campus) {
    ({ query: { filters: { campus } } } = ctx);
  }
  if (user) {
    if (!userRights(user, rights) && !userRights(user, localRights, campus)) {
      ctx.throw(401, 'Current user not authorized to do this');
    }
  } else if (!anonymousRights(rights)) {
    ctx.throw(401, 'Anonymous user not authorized to do this');
  }
  await next();
};
