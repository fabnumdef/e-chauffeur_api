// No choice, I've to ignore this rule, it's not really a cycle import because we're not importing the same part
// of the tree
// eslint-disable-next-line import/no-cycle
import {
  stdRule, campusRule, selfEditingUserRule, roleEditingRule,
} from './rules';

export const CAN_LOGIN = stdRule('login');

export const CAN_EDIT_CAR_MODEL = stdRule('canEditCarModel');
export const CAN_CREATE_CAR_MODEL = stdRule('canCreateCarModel');
export const CAN_LIST_CAR_MODEL = stdRule('canListCarModel');
export const CAN_GET_CAR_MODEL = stdRule('canGetCarModel');
export const CAN_REMOVE_CAR_MODEL = stdRule('canRemoveCarModel');

export const CAN_EDIT_CAR_EVENT = stdRule('canEditCarEvent');
export const CAN_CREATE_CAR_EVENT = stdRule('canCreateCarEvent');
export const CAN_LIST_CAR_EVENT = stdRule('canListCarEvent');
export const CAN_GET_CAR_EVENT = stdRule('canGetCarEvent');
export const CAN_REMOVE_CAR_EVENT = stdRule('canRemoveCarEvent');

export const CAN_EDIT_USER = stdRule('canEditUser');
export const CAN_CREATE_USER = stdRule('canCreateUser');
export const CAN_LIST_USER = stdRule('canListUser');
export const CAN_GET_USER = stdRule('canGetUser');
export const CAN_REMOVE_USER = stdRule('canRemoveUser');

export const CAN_EDIT_SELF_USER_PASSWORD = selfEditingUserRule('canEditSelfUserPassword');
export const CAN_EDIT_SELF_USER_NAME = selfEditingUserRule('canEditSelfUserName');

export const CAN_EDIT_USER_EVENT = stdRule('canEditUserEvent');
export const CAN_CREATE_USER_EVENT = stdRule('canCreateUserEvent');
export const CAN_LIST_USER_EVENT = stdRule('canListUserEvent');
export const CAN_GET_USER_EVENT = stdRule('canGetUserEvent');
export const CAN_REMOVE_USER_EVENT = stdRule('canRemoveUserEvent');

export const CAN_EDIT_CAMPUS = stdRule('canEditCampus');
export const CAN_CREATE_CAMPUS = stdRule('canCreateCampus');
export const CAN_LIST_CAMPUS = stdRule('canListCampus');
export const CAN_GET_CAMPUS = stdRule('canGetCampus');
export const CAN_REMOVE_CAMPUS = stdRule('canRemoveCampus');

export const CAN_GET_CAMPUS_STATS = campusRule('canGetCampusStats');

export const CAN_LIST_CAMPUS_CAR = campusRule('canListCampusCar');
export const CAN_LIST_CAMPUS_DRIVER_RIDE = campusRule('canListCampusDriverRide');

export const CAN_LIST_CAMPUS_DRIVER = campusRule('canListCampusDriver');
export const CAN_GET_CAMPUS_DRIVER = campusRule('canGetCampusDriver');
export const CAN_CREATE_CAMPUS_DRIVER = campusRule('canCreateCampusDriver');
export const CAN_EDIT_CAMPUS_DRIVER = campusRule('canEditCampusDriver');
export const CAN_REMOVE_CAMPUS_DRIVER = campusRule('canRemoveCampusDriver');

export const CAN_LIST_PHONE_LOCAL = campusRule('canListPhoneLocal');
export const CAN_GET_PHONE_LOCAL = campusRule('canGetPhoneLocal');
export const CAN_CREATE_PHONE_LOCAL = campusRule('canCreatePhoneLocal');
export const CAN_EDIT_PHONE_LOCAL = campusRule('canEditPhoneLocal');
export const CAN_REMOVE_PHONE_LOCAL = campusRule('canRemovePhoneLocal');

export const CAN_LIST_PHONE_MODEL = stdRule('canListPhoneModel');
export const CAN_GET_PHONE_MODEL = stdRule('canGetPhoneModel');
export const CAN_CREATE_PHONE_MODEL = stdRule('canCreatePhoneModel');
export const CAN_EDIT_PHONE_MODEL = stdRule('canEditPhoneModel');
export const CAN_REMOVE_PHONE_MODEL = stdRule('canRemovePhoneModel');

export const CAN_EDIT_CATEGORY = stdRule('canEditCategory');
export const CAN_CREATE_CATEGORY = stdRule('canCreateCategory');
export const CAN_LIST_CATEGORY = stdRule('canListCategory');
export const CAN_GET_CATEGORY = stdRule('canGetCategory');
export const CAN_REMOVE_CATEGORY = stdRule('canRemoveCategory');

export const CAN_EDIT_CAR = stdRule('canEditCar');
export const CAN_CREATE_CAR = stdRule('canCreateCar');
export const CAN_LIST_CAR = stdRule('canListCar');
export const CAN_GET_CAR = stdRule('canGetCar');
export const CAN_REMOVE_CAR = stdRule('canRemoveCar');

export const CAN_EDIT_POI = stdRule('canEditPoi');
export const CAN_CREATE_POI = stdRule('canCreatePoi');
export const CAN_LIST_POI = stdRule('canListPoi');
export const CAN_GET_POI = stdRule('canGetPoi');
export const CAN_REMOVE_POI = stdRule('canRemovePoi');

export const CAN_EDIT_POI_LOCAL = campusRule('canEditPoiLocal');
export const CAN_CREATE_POI_LOCAL = campusRule('canCreatePoiLocal');
export const CAN_LIST_POI_LOCAL = campusRule('canListPoiLocal');
export const CAN_GET_POI_LOCAL = campusRule('canGetPoiLocal');
export const CAN_REMOVE_POI_LOCAL = campusRule('canRemovePoiLocal');

export const CAN_LIST_LOG = stdRule('canListLog');

export const CAN_EDIT_RIDE = stdRule('canEditRide');
export const CAN_EDIT_RIDE_STATUS = stdRule('canEditRideStatus');
export const CAN_CREATE_RIDE = stdRule('canCreateRide');
export const CAN_LIST_RIDE = stdRule('canListRide');
export const CAN_GET_RIDE = stdRule('canGetRide');
export const CAN_GET_RIDE_POSITION = stdRule('canGetRidePosition');

export const CAN_SEND_FEEDBACK = stdRule('canSendFeedback');

export const CAN_REVOKE_ROLE_SUPERADMIN = stdRule('canRevokeRoleSuperAdmin');
export const CAN_ADD_ROLE_SUPERADMIN = stdRule('canAddRoleSuperAdmin');

export const CAN_REVOKE_ROLE_ADMIN = stdRule('canRevokeRoleAdmin');
export const CAN_ADD_ROLE_ADMIN = stdRule('canAddRoleAdmin');

export const CAN_REVOKE_ROLE_LOCAL_REGULATOR = roleEditingRule('canRevokeRoleLocalRegulator');
export const CAN_ADD_ROLE_LOCAL_REGULATOR = roleEditingRule('canAddRoleLocalRegulator');
export const CAN_REVOKE_ROLE_REGULATOR = stdRule('canRevokeRoleRegulator');
export const CAN_ADD_ROLE_REGULATOR = stdRule('canAddRoleRegulator');

export const CAN_REVOKE_ROLE_LOCAL_DRIVER = roleEditingRule('canRevokeRoleLocalDriver');
export const CAN_ADD_ROLE_LOCAL_DRIVER = roleEditingRule('canAddRoleLocalDriver');
export const CAN_REVOKE_ROLE_DRIVER = stdRule('canRevokeRoleDriver');
export const CAN_ADD_ROLE_DRIVER = stdRule('canAddRoleDriver');

export const CAN_LIST_ALL_CAMPUSES = stdRule('canListAllCampuses');
