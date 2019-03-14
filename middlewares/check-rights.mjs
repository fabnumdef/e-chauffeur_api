export const checkCampusRights = (cps = false, ...rights) => async (ctx, next) => {
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
    throw new Error('Current user not authorized to do this');
  }
  await next();
};

export default (...rights) => checkCampusRights(false, ...rights);