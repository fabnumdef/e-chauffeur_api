import mongoose from 'mongoose';
import createdAtPlugin from './helpers/created-at';

const { Schema } = mongoose;

const PoiSchema = new Schema({
  _id: String,
  label: String,
  location: {
    type: {
      type: String,
      enum: ['Point'],
    },
    coordinates: {
      type: [Number],
    },
  },
  campus: {
    _id: { type: String },
    name: String,
  },
  enabled: {
    type: Boolean,
    default: true,
  },
});

PoiSchema.plugin(createdAtPlugin);

PoiSchema.virtual('campus.id')
  .get(function get() {
    return this.campus._id;
  })
  .set(function set(id) {
    this.campus._id = id;
  });

PoiSchema.statics.formatFilters = function formatFilters(rawFilters, queryParams, searchParams) {
  let queryFilter = { ...rawFilters };

  if (queryFilter.enabled !== 'true') {
    queryFilter = {
      ...queryFilter,
      enabled: { $ne: false },
    };
  }

  delete queryFilter.enabled;

  if (queryParams && searchParams) {
    queryFilter.$or = [
      {
        _id: new RegExp(searchParams, 'i'),
      },
      {
        label: new RegExp(searchParams, 'i'),
      },
    ];
  }

  if (queryFilter.length < 1) {
    return null;
  }
  return queryFilter;
};

PoiSchema.statics.countDocumentsWithin = function countDocumentsWithin(...params) {
  const filter = this.formatFilters(...params);
  return this.countDocuments(filter);
};

PoiSchema.statics.findWithin = function findWithin(...params) {
  const filter = this.formatFilters(...params);
  return this.find(filter);
};

PoiSchema.index({
  _id: 'text',
  label: 'text',
});

export default mongoose.model('Poi', PoiSchema);
