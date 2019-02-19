import mongoose from 'mongoose';
import rights from './rights.json';

const { Schema } = mongoose;

const RoleSchema = new Schema({
  _id: String,
  inherit: [{
    _id: {
      type: String,
      required: true,
      validate: {
        validator(v) {
          return this.parent()._id !== v; // @todo: Add more resilient cycle checking
        },
      },
      alias: 'id',
    },
  }],
  rights: [{
    type: String,
    required: true,
    validate: {
      validator: a => rights.includes(a),
    },
  }],
  campuses: [{
    _id: { type: String, required: true, alias: 'id' },
    name: { type: String, required: true },
  }],
  // @todo: Add caching system
  cached: [{
    _id: false,
    rights: [String],
    campuses: [{
      _id: { type: String, required: true, alias: 'id' },
      name: { type: String, required: true },
    }],
  }],
});

RoleSchema.pre('save', function beforeSave() {
  return this.updateCache();
});

RoleSchema.post('save', async (doc) => {
  const Role = mongoose.model('Role');
  const roles = await Role.find({
    'inherit._id': doc._id,
  });
  const rolesUpdated = await Promise.all(roles.map(async r => (await r.updateCache()).save()));
  const usersUpdated = await Promise.all((await doc.updateUserRights()).map(u => u.save()));
  return Promise.all(
    [
      rolesUpdated,
      usersUpdated,
    ],
  );
});

// @todo: Defer update + batch process
RoleSchema.methods.updateCache = async function updateCache() { // @todo: Optimize duplicates
  const Role = mongoose.model('Role');

  const lookup = async (toLookUp = [], previouslyLookedUp = []) => {
    const roles = await Role.find({ _id: { $in: toLookUp } });
    const nextLoopLookUp = roles.map(role => role.inherit.map(i => i._id)).reduce((a, b) => a.concat(b), []);
    if (nextLoopLookUp.length) {
      return roles.concat(await lookup(nextLoopLookUp, previouslyLookedUp.concat(roles.map(r => r._id))));
    }
    return roles;
  };
  this.cached = (await lookup(this.inherit.map(i => i._id)));
  return this;
};

// @todo: Defer update + batch process
RoleSchema.methods.updateUserRights = async function updateUserRights() {
  const User = mongoose.model('User');
  const users = await User.find({ 'roles._id': this._id });
  return Promise.all(users.map(async u => u.updateRightsCache()));
};

export default mongoose.model('Role', RoleSchema);
