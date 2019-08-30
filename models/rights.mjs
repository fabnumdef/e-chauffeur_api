// No choice, I've to ignore this rule, it's not really a cycle import because we're not importing the same part
// of the tree
// eslint-disable-next-line import/no-cycle
import {
  stdRule, campusRule, selfEditingUserRule, roleEditingRule,
} from './rules';

export const CAN_LOGIN = stdRule();

export const CAN_EDIT_CAR_MODEL = stdRule();
export const CAN_CREATE_CAR_MODEL = stdRule();
export const CAN_LIST_CAR_MODEL = stdRule();
export const CAN_GET_CAR_MODEL = stdRule();
export const CAN_REMOVE_CAR_MODEL = stdRule();

export const CAN_EDIT_CAR_EVENT = stdRule();
export const CAN_CREATE_CAR_EVENT = stdRule();
export const CAN_LIST_CAR_EVENT = stdRule();
export const CAN_GET_CAR_EVENT = stdRule();
export const CAN_REMOVE_CAR_EVENT = stdRule();

export const CAN_EDIT_USER = stdRule();
export const CAN_EDIT_USER_SENSITIVE_DATA = stdRule();
export const CAN_CREATE_USER = stdRule();
export const CAN_LIST_USER = stdRule();
export const CAN_GET_USER = stdRule();
export const CAN_REMOVE_USER = stdRule();

export const CAN_SEND_CREATION_TOKEN = stdRule();

export const CAN_EDIT_SELF_USER_PASSWORD = selfEditingUserRule();
export const CAN_EDIT_SELF_USER_NAME = selfEditingUserRule();

export const CAN_EDIT_USER_EVENT = stdRule();
export const CAN_CREATE_USER_EVENT = stdRule();
export const CAN_LIST_USER_EVENT = stdRule();
export const CAN_GET_USER_EVENT = stdRule();
export const CAN_REMOVE_USER_EVENT = stdRule();

export const CAN_EDIT_CAMPUS = stdRule();
export const CAN_CREATE_CAMPUS = stdRule();
export const CAN_LIST_CAMPUS = stdRule();
export const CAN_GET_CAMPUS = stdRule();
export const CAN_REMOVE_CAMPUS = stdRule();

export const CAN_GET_CAMPUS_STATS = campusRule();

export const CAN_LIST_CAMPUS_CAR = campusRule();
export const CAN_LIST_CAMPUS_DRIVER_RIDE = campusRule();

export const CAN_LIST_CAMPUS_DRIVER = campusRule();
export const CAN_GET_CAMPUS_DRIVER = campusRule();
export const CAN_CREATE_CAMPUS_DRIVER = campusRule();
export const CAN_EDIT_CAMPUS_DRIVER = campusRule();
export const CAN_REMOVE_CAMPUS_DRIVER = campusRule();

export const CAN_LIST_PHONE_LOCAL = campusRule();
export const CAN_GET_PHONE_LOCAL = campusRule();
export const CAN_CREATE_PHONE_LOCAL = campusRule();
export const CAN_EDIT_PHONE_LOCAL = campusRule();
export const CAN_REMOVE_PHONE_LOCAL = campusRule();

export const CAN_LIST_PHONE_MODEL = stdRule();
export const CAN_GET_PHONE_MODEL = stdRule();
export const CAN_CREATE_PHONE_MODEL = stdRule();
export const CAN_EDIT_PHONE_MODEL = stdRule();
export const CAN_REMOVE_PHONE_MODEL = stdRule();

export const CAN_EDIT_CATEGORY = stdRule();
export const CAN_CREATE_CATEGORY = stdRule();
export const CAN_LIST_CATEGORY = stdRule();
export const CAN_GET_CATEGORY = stdRule();
export const CAN_REMOVE_CATEGORY = stdRule();

export const CAN_EDIT_CAR = stdRule();
export const CAN_CREATE_CAR = stdRule();
export const CAN_LIST_CAR = stdRule();
export const CAN_GET_CAR = stdRule();
export const CAN_REMOVE_CAR = stdRule();

export const CAN_EDIT_POI = stdRule();
export const CAN_CREATE_POI = stdRule();
export const CAN_LIST_POI = stdRule();
export const CAN_GET_POI = stdRule();
export const CAN_REMOVE_POI = stdRule();

export const CAN_EDIT_POI_LOCAL = campusRule();
export const CAN_CREATE_POI_LOCAL = campusRule();
export const CAN_LIST_POI_LOCAL = campusRule();
export const CAN_GET_POI_LOCAL = campusRule();
export const CAN_REMOVE_POI_LOCAL = campusRule();

export const CAN_LIST_LOG = stdRule();

export const CAN_EDIT_RIDE = stdRule();
export const CAN_EDIT_RIDE_STATUS = stdRule();
export const CAN_CREATE_RIDE = stdRule();
export const CAN_REQUEST_RIDE = stdRule();
export const CAN_LIST_RIDE = stdRule();
export const CAN_GET_RIDE = stdRule();
export const CAN_GET_RIDE_POSITION = stdRule();

export const CAN_SEND_FEEDBACK = stdRule();

export const CAN_REVOKE_ROLE_SUPERADMIN = stdRule();
export const CAN_ADD_ROLE_SUPERADMIN = stdRule();

export const CAN_REVOKE_ROLE_ADMIN = stdRule();
export const CAN_ADD_ROLE_ADMIN = stdRule();

export const CAN_REVOKE_ROLE_LOCAL_REGULATOR = roleEditingRule();
export const CAN_ADD_ROLE_LOCAL_REGULATOR = roleEditingRule();
export const CAN_REVOKE_ROLE_REGULATOR = stdRule();
export const CAN_ADD_ROLE_REGULATOR = stdRule();

export const CAN_REVOKE_ROLE_LOCAL_DRIVER = roleEditingRule();
export const CAN_ADD_ROLE_LOCAL_DRIVER = roleEditingRule();
export const CAN_REVOKE_ROLE_DRIVER = stdRule();
export const CAN_ADD_ROLE_DRIVER = stdRule();

export const CAN_LIST_ALL_CAMPUSES = stdRule();
