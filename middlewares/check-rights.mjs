const checkRights = (cps = false, ctx, ...rights) => {
  const { user } = ctx.state;
  let campus = cps;
  if (campus) {
    if (!ctx.params.campus_id) {
      throw new Error('campus_id required in params');
    }
    campus = ctx.params.campus_id;
  }

  if (
    !user
    || !rights.reduce(
      (acc, right) => acc || user.cachedRights.reduce(
        (cachedAcc, cachedRow) => cachedAcc || (
          cachedRow.rights.find(
            r => right === r,
          )
        && (
          !campus || cachedRow.campuses.find(
            c => c._id === campus,
          )
        )
        ),
        false,
      ),
      false,
    )
  ) {
    return false;
  }
  return true;
};

export const restrictedFieldsInAnonymous = (restrictedFields, ...rights) => async (ctx, next) => {
  const authorized = checkRights(false, ctx, ...rights);
  if (!authorized) {
    ctx.query = { mask: restrictedFields };
  }
  await next();
};

export const checkCampusRights = (campus = false, ...rights) => async (ctx, next) => {
  const authorized = checkRights(campus, ctx, ...rights);
  if (!authorized) {
    throw new Error('Current user not authorized to do this');
  }
  await next();
};

export default (...rights) => checkCampusRights(false, ...rights);
