import mongoose from 'mongoose';

const { Schema } = mongoose;

const CarEventSchema = new Schema({
  title: String,
  start: Date,
  end: Date,
  car: {
    _id: { type: String, required: true, alias: 'id' },
    label: { type: String, required: true },
    campus: {
      _id: { type: String, required: true, alias: 'id' },
    },
  },
});

CarEventSchema.pre('validate', async function beforeSave() {
  const Car = mongoose.model('Car');
  this.car = await Car.findById(this.car._id).lean();
});

CarEventSchema.virtual('car.id')
  .get(function get() {
    return this.car._id;
  })
  .set(function set(id) {
    this.car._id = id;
  });
// CarEventSchema.virtual('car.campus.id')
//   .get(function get() {
//     return this.car.campus._id;
//   })
//   .set(function set(id) {
//     this.car.campus._id = id;
//   });

export default mongoose.model('CarEvent', CarEventSchema, 'car-events');
