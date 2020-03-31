// eslint-disable-next-line import/no-cycle
import * as rights from './rights';

export const ROLE_ANONYMOUS_NAME = 'ROLE_ANONYMOUS';
export const ROLE_USER_NAME = 'ROLE_USER';
export const ROLE_DRIVER_NAME = 'ROLE_DRIVER';
export const ROLE_REGULATOR_NAME = 'ROLE_REGULATOR';
export const ROLE_ADMIN_NAME = 'ROLE_ADMIN';
export const ROLE_SUPERADMIN_NAME = 'ROLE_SUPERADMIN';

class RoleList extends Set {
  constructor(name, ...items) {
    super(items.reduce((acc, row) => acc.concat(row instanceof Set ? Array.from(row) : row), []));
    this.name = name;
    this.inheritance = items.filter((i) => i instanceof Set);
  }

  get inheritanceList() {
    return this.inheritance.concat(this.inheritance.reduce((acc, list) => acc.concat(list.inheritanceList), []));
  }

  hasRoleInInheritance(role) {
    return this.inheritanceList.reduce((bool, row) => bool || row.name === role, false);
  }
}
const roles = {};

export const ROLE_ANONYMOUS = new RoleList(
  ROLE_ANONYMOUS_NAME,
  rights.CAN_LOGIN,
  rights.CAN_GET_RIDE_WITH_TOKEN,
  rights.CAN_GET_RIDE_POSITION,
  rights.CAN_LIST_CAMPUS_BASIC,
  rights.CAN_SEND_CREATION_TOKEN,
  rights.CAN_CREATE_RATING,
);
roles.ROLE_ANONYMOUS = ROLE_ANONYMOUS;

export const ROLE_USER = new RoleList(
  ROLE_USER_NAME,
  ROLE_ANONYMOUS,
  rights.CAN_ACCESS_OWN_DATA_ON_RIDE,
  rights.CAN_EDIT_SELF_USER_NAME,
  rights.CAN_EDIT_SELF_USER_PASSWORD,
  rights.CAN_EDIT_SELF_USER_SENSITIVE_DATA,
  rights.CAN_GET_CAMPUS_BASIC,

  rights.CAN_REQUEST_RIDE,
  rights.CAN_GET_OWNED_RIDE,
  rights.CAN_EDIT_OWNED_RIDE,
  rights.CAN_EDIT_OWNED_RIDE_STATUS,
  rights.CAN_LIST_SELF_RIDE,
  rights.CAN_DELETE_SELF_RIDE,

  rights.CAN_GET_POI,
  rights.CAN_LIST_POI,

  rights.CAN_REMOVE_SELF_USER,
  rights.CAN_EDIT_USER_WITHOUT_UPPER_RIGHTS,
);
roles.ROLE_USER = ROLE_USER;

export const ROLE_DRIVER = new RoleList(
  ROLE_DRIVER_NAME,
  ROLE_USER,
  rights.CAN_GET_CAMPUS,
  rights.CAN_LIST_CAMPUS,

  rights.CAN_LIST_CAR_MODEL,
  rights.CAN_GET_CAR_MODEL,

  rights.CAN_LIST_USER_EVENT,
  rights.CAN_GET_USER_EVENT,

  rights.CAN_LIST_CATEGORY,

  rights.CAN_EDIT_RIDE_STATUS,
  rights.CAN_LIST_CAMPUS_DRIVER_RIDE,
);
roles.ROLE_DRIVER = ROLE_DRIVER;

export const ROLE_REGULATOR = new RoleList(
  ROLE_REGULATOR_NAME,
  ROLE_DRIVER,
  rights.CAN_ACCESS_PERSONNAL_DATA_ON_RIDE,
  rights.CAN_LIST_USER,
  rights.CAN_GET_USER,
  rights.CAN_EDIT_USER,
  rights.CAN_CREATE_USER,

  rights.CAN_LIST_CAR,
  rights.CAN_EDIT_CAR,
  rights.CAN_CREATE_CAR,
  rights.CAN_GET_CAR,
  rights.CAN_REMOVE_CAR,

  rights.CAN_GET_CAMPUS_STATS,

  rights.CAN_LIST_CAMPUS_CAR,

  rights.CAN_LIST_CAMPUS_DRIVER,
  rights.CAN_GET_CAMPUS_DRIVER,
  rights.CAN_CREATE_CAMPUS_DRIVER,
  rights.CAN_EDIT_CAMPUS_DRIVER,
  rights.CAN_REMOVE_CAMPUS_DRIVER,

  rights.CAN_EDIT_CAR_EVENT,
  rights.CAN_GET_CAR_EVENT,
  rights.CAN_LIST_CAR_EVENT,
  rights.CAN_CREATE_CAR_EVENT,
  rights.CAN_REMOVE_CAR_EVENT,

  rights.CAN_EDIT_USER_EVENT,
  rights.CAN_CREATE_USER_EVENT,
  rights.CAN_REMOVE_USER_EVENT,

  rights.CAN_LIST_PHONE_MODEL,
  rights.CAN_GET_PHONE_MODEL,

  rights.CAN_SEND_FEEDBACK,

  rights.CAN_LIST_RIDE,
  rights.CAN_CREATE_RIDE,
  rights.CAN_EDIT_RIDE,
  rights.CAN_GET_RIDE,
  rights.CAN_REVOKE_ROLE_LOCAL_DRIVER,
  rights.CAN_ADD_ROLE_LOCAL_DRIVER,

  rights.CAN_LIST_PHONE_LOCAL,
  rights.CAN_GET_PHONE_LOCAL,

  rights.CAN_CREATE_TIME_SLOT,
  rights.CAN_LIST_TIME_SLOT,
  rights.CAN_EDIT_TIME_SLOT,
  rights.CAN_REMOVE_TIME_SLOT,

  rights.CAN_CREATE_LOOP_PATTERN,
  rights.CAN_LIST_LOOP_PATTERN,
  rights.CAN_GET_LOOP_PATTERN,
  rights.CAN_UPDATE_LOOP_PATTERN,
  rights.CAN_DELETE_LOOP_PATTERN,
);
roles.ROLE_REGULATOR = ROLE_REGULATOR;

export const ROLE_ADMIN = new RoleList(
  ROLE_ADMIN_NAME,
  ROLE_REGULATOR,
  rights.CAN_EDIT_POI_LOCAL,
  rights.CAN_CREATE_POI_LOCAL,
  rights.CAN_REMOVE_POI_LOCAL,

  rights.CAN_CREATE_PHONE_LOCAL,
  rights.CAN_EDIT_PHONE_LOCAL,
  rights.CAN_REMOVE_PHONE_LOCAL,

  rights.CAN_EDIT_SELF_CAMPUS,
  rights.CAN_LIST_CAMPUS_USER,
  rights.CAN_GET_CAMPUS_USER,
  rights.CAN_CREATE_CAMPUS_USER,
  rights.CAN_EDIT_CAMPUS_USER,
  rights.CAN_REMOVE_CAMPUS_USER,

  rights.CAN_REVOKE_ROLE_LOCAL_REGULATOR,
  rights.CAN_ADD_ROLE_LOCAL_REGULATOR,

  rights.CAN_EDIT_USER_SENSITIVE_DATA,
);
roles.ROLE_ADMIN = ROLE_ADMIN;

export const ROLE_SUPERADMIN = new RoleList(
  ROLE_SUPERADMIN_NAME,
  ROLE_ADMIN,
  rights.CAN_EDIT_CAR_MODEL,
  rights.CAN_CREATE_CAR_MODEL,
  rights.CAN_REMOVE_CAR_MODEL,
  rights.CAN_REMOVE_CAMPUS,

  rights.CAN_REMOVE_USER,

  rights.CAN_EDIT_CAMPUS,
  rights.CAN_CREATE_CAMPUS,
  rights.CAN_REMOVE_CAMPUS,

  rights.CAN_EDIT_CATEGORY,
  rights.CAN_CREATE_CATEGORY,
  rights.CAN_GET_CATEGORY,
  rights.CAN_REMOVE_CATEGORY,

  rights.CAN_GET_POSITION_HISTORY,

  rights.CAN_CREATE_PHONE_MODEL,
  rights.CAN_EDIT_PHONE_MODEL,
  rights.CAN_REMOVE_PHONE_MODEL,

  rights.CAN_REVOKE_ROLE_SUPERADMIN,
  rights.CAN_ADD_ROLE_SUPERADMIN,
  rights.CAN_REVOKE_ROLE_ADMIN,
  rights.CAN_ADD_ROLE_ADMIN,
  rights.CAN_REVOKE_ROLE_REGULATOR,
  rights.CAN_ADD_ROLE_REGULATOR,
  rights.CAN_REVOKE_ROLE_DRIVER,
  rights.CAN_ADD_ROLE_DRIVER,

  rights.CAN_LIST_ALL_CAMPUSES,

  rights.CAN_LIST_RATING,
  rights.CAN_GET_RATING,
  rights.CAN_GET_STATS,
);
roles.ROLE_SUPERADMIN = ROLE_SUPERADMIN;

export const keys = Object.keys(roles)
  .map((r) => ({ [r]: roles[r].name }))
  .reduce((acc, r) => Object.assign(acc, r), {});
