import transform from 'lodash.transform';
import isPlainObject from 'lodash.isplainobject';
import set from 'lodash.set';
import mongoose from 'mongoose';

function deepTransform(object, iterator, defaultAcc = {}, keys = []) {
  return transform(object, (acc, value, key) => {
    const currentKeyPath = [...keys, key];
    if (isPlainObject(value)) {
      deepTransform(value, iterator, acc, currentKeyPath);
    } else {
      iterator(acc, value, currentKeyPath.join('.'));
    }
  }, defaultAcc);
}

export default function cleanObjectPlugin(schema, modelName = '') {
  /* eslint-disable no-param-reassign */
  schema.methods.toCleanObject = function toCleanObject(config = {}, ctx) {
    if (!ctx || !ctx.may) {
      return this.toObject ? this.toObject(config) : this;
    }
    return deepTransform(this.toObject ? this.toObject(config) : this, (acc, value, path) => {
      const definition = (schema.paths[path] || {}).options || null;
      if (!definition || typeof definition.canEmit === 'undefined' || definition.canEmit === true) {
        set(acc, path, value);
      } else if (
        Array.isArray(definition.canEmit)
        && definition.canEmit.reduce((bool, right) => bool || ctx.may(right, this), false)
      ) {
        set(acc, path, value);
      }
    });
  };
  schema.statics.cleanObject = (o, ...params) => {
    const Model = mongoose.model(modelName);

    const entity = new Model(o);
    return entity.toCleanObject(...params);
  };
}
