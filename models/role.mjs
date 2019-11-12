import * as rights from './rights';

class RoleList extends Set {
  constructor(...items) {
    super(items);
  }
}

export const ROLE_ANONYMOUS = new RoleList(
  rights.CAN_LOGIN,
  rights.CAN_GET_RIDE_WITH_TOKEN,
  rights.CAN_GET_RIDE_POSITION,
  rights.CAN_LIST_CAMPUS_BASIC,
  rights.CAN_SEND_CREATION_TOKEN,
  rights.CAN_CREATE_RATING,
);

export const ROLE_USER = new RoleList(
  ...ROLE_ANONYMOUS,

  rights.CAN_EDIT_SELF_USER_NAME,
  rights.CAN_EDIT_SELF_USER_PASSWORD,
  rights.CAN_GET_CAMPUS_BASIC,

  rights.CAN_REQUEST_RIDE,
  rights.CAN_GET_OWNED_RIDE,
  rights.CAN_EDIT_OWNED_RIDE,
  rights.CAN_EDIT_OWNED_RIDE_STATUS,

  rights.CAN_GET_POI_LOCAL,
  rights.CAN_LIST_POI_LOCAL,
  rights.CAN_GET_POI,
  rights.CAN_LIST_POI,
);

export const ROLE_DRIVER = new RoleList(
  ...ROLE_USER,
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

export const ROLE_REGULATOR = new RoleList(
  ...ROLE_DRIVER,

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
);

export const ROLE_ADMIN = new RoleList(
  ...ROLE_REGULATOR,

  rights.CAN_EDIT_POI_LOCAL,
  rights.CAN_CREATE_POI_LOCAL,
  rights.CAN_REMOVE_POI_LOCAL,

  rights.CAN_CREATE_PHONE_LOCAL,
  rights.CAN_EDIT_PHONE_LOCAL,
  rights.CAN_REMOVE_PHONE_LOCAL,

  rights.CAN_REVOKE_ROLE_LOCAL_REGULATOR,
  rights.CAN_ADD_ROLE_LOCAL_REGULATOR,

  rights.CAN_EDIT_USER_SENSITIVE_DATA,
);

export const ROLE_SUPERADMIN = new RoleList(
  ...ROLE_ADMIN,

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

  rights.CAN_EDIT_POI,
  rights.CAN_CREATE_POI,

  rights.CAN_REMOVE_POI,

  rights.CAN_LIST_LOG,
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
);
