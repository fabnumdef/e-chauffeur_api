import * as rights from './rights';

export const ROLE_ANONYMOUS = [
  rights.CAN_LOGIN,
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

  rights.CAN_LIST_CATEGORY,
];

export const ROLE_REGULATOR = [
  ...ROLE_DRIVER,

  rights.CAN_LIST_USER,
  rights.CAN_GET_USER,
  rights.CAN_EDIT_USER,
  rights.CAN_CREATE_USER,

  rights.CAN_EDIT_CAR_EVENT,
  rights.CAN_CREATE_CAR_EVENT,
  rights.CAN_REMOVE_CAR_EVENT,
  rights.CAN_REMOVE_CAMPUS,

  rights.CAN_SEND_FEEDBACK,
];

export const ROLE_ADMIN = [
  ...ROLE_REGULATOR,
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
  rights.CAN_REMOVE_POI,
];
