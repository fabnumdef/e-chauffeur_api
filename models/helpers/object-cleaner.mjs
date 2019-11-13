import pickBy from 'lodash.pickby';
import get from 'lodash.get';
import mongoose from 'mongoose';

export default function cleanObjectPlugin(schema, modelName = '') {
  /* eslint-disable no-param-reassign */
  schema.methods.toCleanObject = function toCleanObject(config = {}, ctx) {
    if (!ctx || !ctx.may) {
      return this.toObject ? this.toObject(config) : this;
    }
    return pickBy(this.toObject ? this.toObject(config) : this, (value, key) => {
      const definition = get(schema.obj, key);
      if (!definition || typeof definition.canEmit === 'undefined') {
        return true;
      }

      if (definition.canEmit === true || Array.isArray(definition.canEmit)) {
        return ctx.may(...definition.canEmit);
      }

      return false;
    });
  };
  schema.statics.cleanObject = (o, ...params) => {
    const Model = mongoose.model(modelName);

    const entity = new Model(o);
    return entity.toCleanObject(...params);
  };
}
