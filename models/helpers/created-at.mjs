export default function createdAtPlugin(schema) {
  schema.path('createdAt', { type: Date, default: Date.now });
}
