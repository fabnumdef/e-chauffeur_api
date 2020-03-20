// No choice, I've to ignore this rule, it's not really a cycle import because we're not importing the same part
// of the tree
// eslint-disable-next-line import/no-cycle
import {
  stdRule, campusRule, selfEditingUserRule, roleEditingRule, ownedRideRule, tokenRideRule, onlyLowerRightsRule,
} from './rules';

export const CAN_LOGIN = stdRule('CAN_LOGIN');

export const CAN_EDIT_CAR_MODEL = stdRule('CAN_EDIT_CAR_MODEL');
export const CAN_CREATE_CAR_MODEL = stdRule('CAN_CREATE_CAR_MODEL');
export const CAN_LIST_CAR_MODEL = stdRule('CAN_LIST_CAR_MODEL');
export const CAN_GET_CAR_MODEL = stdRule('CAN_GET_CAR_MODEL');
export const CAN_REMOVE_CAR_MODEL = stdRule('CAN_REMOVE_CAR_MODEL');

export const CAN_EDIT_CAR_EVENT = stdRule('CAN_EDIT_CAR_EVENT');
export const CAN_CREATE_CAR_EVENT = stdRule('CAN_CREATE_CAR_EVENT');
export const CAN_LIST_CAR_EVENT = stdRule('CAN_LIST_CAR_EVENT');
export const CAN_GET_CAR_EVENT = stdRule('CAN_GET_CAR_EVENT');
export const CAN_REMOVE_CAR_EVENT = stdRule('CAN_REMOVE_CAR_EVENT');


export const CAN_EDIT_USER = stdRule('CAN_EDIT_USER');
export const CAN_EDIT_USER_SENSITIVE_DATA = stdRule('CAN_EDIT_USER_SENSITIVE_DATA');
export const CAN_CREATE_USER = stdRule('CAN_CREATE_USER');
export const CAN_LIST_USER = stdRule('CAN_LIST_USER');
export const CAN_GET_USER = stdRule('CAN_GET_USER');
export const CAN_REMOVE_USER = stdRule('CAN_REMOVE_USER');
export const CAN_REMOVE_SELF_USER = selfEditingUserRule('CAN_REMOVE_SELF_USER');
export const CAN_EDIT_USER_WITHOUT_UPPER_RIGHTS = onlyLowerRightsRule('CAN_EDIT_USER_WITH_LOWER_RIGHTS');

export const CAN_SEND_CREATION_TOKEN = stdRule('CAN_SEND_CREATION_TOKEN');

export const CAN_EDIT_SELF_USER_PASSWORD = selfEditingUserRule('CAN_EDIT_SELF_USER_PASSWORD');
export const CAN_EDIT_SELF_USER_NAME = selfEditingUserRule('CAN_EDIT_SELF_USER_NAME');
export const CAN_EDIT_SELF_USER_SENSITIVE_DATA = selfEditingUserRule('CAN_EDIT_SELF_USER_SENSITIVE_DATA');

export const CAN_EDIT_USER_EVENT = stdRule('CAN_EDIT_USER_EVENT');
export const CAN_CREATE_USER_EVENT = stdRule('CAN_CREATE_USER_EVENT');
export const CAN_LIST_USER_EVENT = stdRule('CAN_LIST_USER_EVENT');
export const CAN_GET_USER_EVENT = stdRule('CAN_GET_USER_EVENT');
export const CAN_REMOVE_USER_EVENT = stdRule('CAN_REMOVE_USER_EVENT');

export const CAN_EDIT_CAMPUS = stdRule('CAN_EDIT_CAMPUS');
export const CAN_EDIT_SELF_CAMPUS = campusRule('CAN_EDIT_SELF_CAMPUS');
export const CAN_CREATE_CAMPUS = stdRule('CAN_CREATE_CAMPUS');
export const CAN_LIST_CAMPUS = stdRule('CAN_LIST_CAMPUS');
export const CAN_LIST_CAMPUS_BASIC = stdRule('CAN_LIST_CAMPUS_BASIC');
export const CAN_GET_CAMPUS = stdRule('CAN_GET_CAMPUS');
export const CAN_GET_CAMPUS_BASIC = stdRule('CAN_GET_CAMPUS_BASIC');
export const CAN_REMOVE_CAMPUS = stdRule('CAN_REMOVE_CAMPUS');

export const CAN_GET_CAMPUS_STATS = campusRule('CAN_GET_CAMPUS_STATS');
export const CAN_GET_STATS = stdRule('CAN_GET_STATS');

export const CAN_LIST_CAMPUS_CAR = campusRule('CAN_LIST_CAMPUS_CAR');
export const CAN_LIST_CAMPUS_DRIVER_RIDE = campusRule('CAN_LIST_CAMPUS_DRIVER_RIDE');

export const CAN_LIST_CAMPUS_DRIVER = campusRule('CAN_LIST_CAMPUS_DRIVER');
export const CAN_GET_CAMPUS_DRIVER = campusRule('CAN_GET_CAMPUS_DRIVER');
export const CAN_CREATE_CAMPUS_DRIVER = campusRule('CAN_CREATE_CAMPUS_DRIVER');
export const CAN_EDIT_CAMPUS_DRIVER = campusRule('CAN_EDIT_CAMPUS_DRIVER');
export const CAN_REMOVE_CAMPUS_DRIVER = campusRule('CAN_REMOVE_CAMPUS_DRIVER');

export const CAN_LIST_CAMPUS_USER = campusRule('CAN_LIST_CAMPUS_USER');
export const CAN_GET_CAMPUS_USER = campusRule('CAN_GET_CAMPUS_USER');
export const CAN_CREATE_CAMPUS_USER = campusRule('CAN_CREATE_CAMPUS_USER');
export const CAN_EDIT_CAMPUS_USER = campusRule('CAN_EDIT_CAMPUS_USER');
export const CAN_REMOVE_CAMPUS_USER = campusRule('CAN_REMOVE_CAMPUS_USER');

export const CAN_LIST_PHONE_LOCAL = campusRule('CAN_LIST_PHONE_LOCAL');
export const CAN_GET_PHONE_LOCAL = campusRule('CAN_GET_PHONE_LOCAL');
export const CAN_CREATE_PHONE_LOCAL = campusRule('CAN_CREATE_PHONE_LOCAL');
export const CAN_EDIT_PHONE_LOCAL = campusRule('CAN_EDIT_PHONE_LOCAL');
export const CAN_REMOVE_PHONE_LOCAL = campusRule('CAN_REMOVE_PHONE_LOCAL');

export const CAN_LIST_PHONE_MODEL = stdRule('CAN_LIST_PHONE_MODEL');
export const CAN_GET_PHONE_MODEL = stdRule('CAN_GET_PHONE_MODEL');
export const CAN_CREATE_PHONE_MODEL = stdRule('CAN_CREATE_PHONE_MODEL');
export const CAN_EDIT_PHONE_MODEL = stdRule('CAN_EDIT_PHONE_MODEL');
export const CAN_REMOVE_PHONE_MODEL = stdRule('CAN_REMOVE_PHONE_MODEL');

export const CAN_EDIT_CATEGORY = stdRule('CAN_EDIT_CATEGORY');
export const CAN_CREATE_CATEGORY = stdRule('CAN_CREATE_CATEGORY');
export const CAN_LIST_CATEGORY = stdRule('CAN_LIST_CATEGORY');
export const CAN_GET_CATEGORY = stdRule('CAN_GET_CATEGORY');
export const CAN_REMOVE_CATEGORY = stdRule('CAN_REMOVE_CATEGORY');

export const CAN_EDIT_CAR = campusRule('CAN_EDIT_CAR');
export const CAN_CREATE_CAR = campusRule('CAN_CREATE_CAR');
export const CAN_LIST_CAR = campusRule('CAN_LIST_CAR');
export const CAN_GET_CAR = campusRule('CAN_GET_CAR');
export const CAN_REMOVE_CAR = campusRule('CAN_REMOVE_CAR');

export const CAN_LIST_POI = stdRule('CAN_LIST_POI');
export const CAN_GET_POI = stdRule('CAN_GET_POI');
export const CAN_EDIT_POI_LOCAL = campusRule('CAN_EDIT_POI_LOCAL');
export const CAN_CREATE_POI_LOCAL = campusRule('CAN_CREATE_POI_LOCAL');
export const CAN_REMOVE_POI_LOCAL = campusRule('CAN_REMOVE_POI_LOCAL');

export const CAN_GET_POSITION_HISTORY = stdRule('CAN_GET_POSITION_HISTORY');

export const CAN_EDIT_RIDE = campusRule('CAN_EDIT_RIDE');
export const CAN_EDIT_RIDE_STATUS = stdRule('CAN_EDIT_RIDE_STATUS');
export const CAN_EDIT_OWNED_RIDE_STATUS = ownedRideRule('CAN_EDIT_OWNED_RIDE_STATUS');
export const CAN_CREATE_RIDE = campusRule('CAN_CREATE_RIDE');
export const CAN_REQUEST_RIDE = campusRule('CAN_REQUEST_RIDE');
export const CAN_GET_OWNED_RIDE = ownedRideRule('CAN_GET_OWNED_RIDE');
export const CAN_GET_RIDE_WITH_TOKEN = tokenRideRule('CAN_GET_RIDE_WITH_TOKEN');
export const CAN_EDIT_OWNED_RIDE = ownedRideRule('CAN_EDIT_OWNED_RIDE');
export const CAN_LIST_RIDE = campusRule('CAN_LIST_RIDE');
export const CAN_GET_RIDE = campusRule('CAN_GET_RIDE');
export const CAN_GET_RIDE_POSITION = stdRule('CAN_GET_RIDE_POSITION');
export const CAN_LIST_SELF_RIDE = selfEditingUserRule('CAN_LIST_SELF_RIDE');
export const CAN_DELETE_SELF_RIDE = selfEditingUserRule('CAN_DELETE_SELF_RIDE');

export const CAN_SEND_FEEDBACK = stdRule('CAN_SEND_FEEDBACK');

export const CAN_REVOKE_ROLE_SUPERADMIN = stdRule('CAN_REVOKE_ROLE_SUPERADMIN');
export const CAN_ADD_ROLE_SUPERADMIN = stdRule('CAN_ADD_ROLE_SUPERADMIN');

export const CAN_REVOKE_ROLE_ADMIN = stdRule('CAN_REVOKE_ROLE_ADMIN');
export const CAN_ADD_ROLE_ADMIN = stdRule('CAN_ADD_ROLE_ADMIN');

export const CAN_REVOKE_ROLE_LOCAL_REGULATOR = roleEditingRule('CAN_REVOKE_ROLE_LOCAL_REGULATOR');
export const CAN_ADD_ROLE_LOCAL_REGULATOR = roleEditingRule('CAN_ADD_ROLE_LOCAL_REGULATOR');
export const CAN_REVOKE_ROLE_REGULATOR = stdRule('CAN_REVOKE_ROLE_REGULATOR');
export const CAN_ADD_ROLE_REGULATOR = stdRule('CAN_ADD_ROLE_REGULATOR');

export const CAN_REVOKE_ROLE_LOCAL_DRIVER = roleEditingRule('CAN_REVOKE_ROLE_LOCAL_DRIVER');
export const CAN_ADD_ROLE_LOCAL_DRIVER = roleEditingRule('CAN_ADD_ROLE_LOCAL_DRIVER');
export const CAN_REVOKE_ROLE_DRIVER = stdRule('CAN_REVOKE_ROLE_DRIVER');
export const CAN_ADD_ROLE_DRIVER = stdRule('CAN_ADD_ROLE_DRIVER');

export const CAN_LIST_ALL_CAMPUSES = stdRule('CAN_LIST_ALL_CAMPUSES');

export const CAN_EDIT_TIME_SLOT = campusRule('CAN_EDIT_TIME_SLOT');
export const CAN_CREATE_TIME_SLOT = campusRule('CAN_CREATE_TIME_SLOT');
export const CAN_LIST_TIME_SLOT = campusRule('CAN_LIST_TIME_SLOT');
export const CAN_REMOVE_TIME_SLOT = campusRule('CAN_REMOVE_TIME_SLOT');

export const CAN_ACCESS_OWN_DATA_ON_RIDE = ownedRideRule('CAN_ACCESS_OWN_DATA_ON_RIDE');
export const CAN_ACCESS_PERSONAL_DATA_ON_RIDE = campusRule('CAN_ACCESS_PERSONAL_DATA_ON_RIDE');

export const CAN_CREATE_RATING = stdRule('CAN_CREATE_RATING');
export const CAN_LIST_RATING = stdRule('CAN_LIST_RATING');
