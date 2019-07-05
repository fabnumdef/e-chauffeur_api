import lGet from 'lodash.get';
import * as roles from '../models/role';

export const resolveRightsMiddleware = (...rights) => async (ctx, next) => {
  ctx.assert(ctx.may, 500, 'Please inject "user may" middleware');

  ctx.assert(
    // The following reduce is a logical OR. To do a logical AND, we just have to chain the middleware multiple times.
    rights.reduce((acc, cur) => acc || ctx.may(cur), false),
    403,
    'You\'re not authorized to perform this actions',
  );

  await next();
};

export default resolveRightsMiddleware;

export const injectUserMayMiddleware = async (ctx, next) => {
  const list = [
    {
      role: ctx.state.user ? 'ROLE_USER' : 'ROLE_ANONYMOUS',
    },
    ...lGet(ctx, 'state.user.roles', []),
  ];

  ctx.may = function userMay(right, ...params) {
    return list.reduce(
      (acc, row) => acc || (
        roles[row.role].has(right)
        && right.rule(
          row,
          ctx,
          ...params,
        )
      ),
      false,
    );
  };
  await next();
};
