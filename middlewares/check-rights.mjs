export const checkCampusRights = (cps = false, ...rights) => async (ctx, next) => {
  let campus = cps;
  if (campus) {
    if (!ctx.params.campus_id) {
      throw new Error('campus_id required in params');
    }
    campus = ctx.params.campus_id;
  }
  if (
    !rights.reduce(
      (acc, right) => acc || ctx.state.user.cachedRights.reduce(
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
