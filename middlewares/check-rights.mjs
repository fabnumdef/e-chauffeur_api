import * as roles from '../models/role';

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
    if (!rights.reduce(
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
    )) {
      throw new Error('Current user not authorized to do this');
    }
  } else if (!rights.reduce(
    (acc, right) => acc || roles.ROLE_ANONYMOUS.find(
      r => right === r,
    ),
    false,
  )) {
    throw new Error('Anonymous user not authorized to do this');
  }
  await next();
};

export default (...rights) => checkRights(false, ...rights);
export const checkCampusRights = (...rights) => checkRights(true, ...rights);
