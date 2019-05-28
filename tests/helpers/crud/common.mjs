export const defaultRouteName = Model => (Model.getDashedName && Model.getDashedName())
  || Model.modelName.toLowerCase();
