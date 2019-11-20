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
  let queryFilter;
  const filters = Object.keys(rawFilters).map((key) => ({
    [key]: rawFilters[key],
  }));

  if (!filters.enabled || filters.enabled === 'false') {
    filters.enabled = { $ne: false };
  }

  if (filters.length > 0) {
    queryFilter = {
      $and: [
        ...filters,
      ],
    };
  }

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
  console.log(queryFilter);
  return queryFilter;
};

PoiSchema.statics.processDocumentsToAddEnable = async function () {
  const docs = await this.find();
  await Promise.all(docs.map(async (doc) => {
    if (doc.enabled) {
      await this.findByIdAndUpdate(doc._id, { enabled: true });
    }
  }));
};

PoiSchema.index({
  _id: 'text',
  label: 'text',
});

export default mongoose.model('Poi', PoiSchema);
