/* eslint-disable-next-line import/prefer-default-export */
export const defaultRouteName = Model => (Model.getDashedName && Model.getDashedName())
  || Model.modelName.toLowerCase();
