import { stdRule, campusRule } from './rules';

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

export const CAN_EDIT_SELF_USER = stdRule('canEditSelfUser');
export const CAN_EDIT_SELF_USER_PASSWORD = stdRule('canEditSelfUserPassword');
export const CAN_EDIT_SELF_USER_NAME = stdRule('canEditSelfUserName');

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
