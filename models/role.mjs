import * as rights from './rights';

export const ROLE_ANONYMOUS = [
  rights.CAN_LOGIN,
  rights.CAN_GET_RIDE,
  rights.CAN_GET_RIDE_POSITION,
  rights.CAN_LIST_CAMPUS,
];

export const ROLE_USER = [
  ...ROLE_ANONYMOUS,
];

export const ROLE_DRIVER = [
  ...ROLE_USER,

  rights.CAN_LIST_CAMPUS,
  rights.CAN_GET_CAMPUS,

  rights.CAN_LIST_CAR_MODEL,
  rights.CAN_GET_CAR_MODEL,

  rights.CAN_LIST_USER_EVENT,
  rights.CAN_GET_USER_EVENT,

  rights.CAN_LIST_CATEGORY,

  rights.CAN_EDIT_RIDE_STATUS,
  rights.CAN_LIST_CAMPUS_DRIVER_RIDE,
];

export const ROLE_REGULATOR = [
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
  rights.CAN_CREATE_CAR_EVENT,
  rights.CAN_REMOVE_CAR_EVENT,

  rights.CAN_EDIT_USER_EVENT,
  rights.CAN_CREATE_USER_EVENT,
  rights.CAN_REMOVE_USER_EVENT,

  rights.CAN_SEND_FEEDBACK,

  rights.CAN_GET_POI_LOCAL,
  rights.CAN_LIST_POI_LOCAL,

  rights.CAN_LIST_RIDE,
  rights.CAN_CREATE_RIDE,
  rights.CAN_EDIT_RIDE,
];

export const ROLE_ADMIN = [
  ...ROLE_REGULATOR,

  rights.CAN_EDIT_POI_LOCAL,
  rights.CAN_CREATE_POI_LOCAL,

  rights.CAN_LIST_PHONE,
  rights.CAN_GET_PHONE,
  rights.CAN_CREATE_PHONE,
  rights.CAN_EDIT_PHONE,
  rights.CAN_REMOVE_PHONE,

  rights.CAN_LIST_PHONE_MODEL,
  rights.CAN_GET_PHONE_MODEL,
  rights.CAN_CREATE_PHONE_MODEL,
  rights.CAN_EDIT_PHONE_MODEL,
  rights.CAN_REMOVE_PHONE_MODEL,
];

export const ROLE_SUPERADMIN = [
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
  rights.CAN_GET_POI,
  rights.CAN_LIST_POI,

  rights.CAN_REMOVE_POI,

  rights.CAN_LIST_LOG,
];
