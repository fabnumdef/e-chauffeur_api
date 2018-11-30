import mongoose from 'mongoose';

export default async (config) => {
  mongoose.connect(config, { useNewUrlParser: true });
};
