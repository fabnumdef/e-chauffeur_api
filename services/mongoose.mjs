import mongoose from 'mongoose';

const connect = async (config) => {
  try {
    const deprecationOptions = {
      useNewUrlParser: true,
      useCreateIndex: true,
      useUnifiedTopology: true,
    };
    await mongoose.connect(config, deprecationOptions);
    // eslint-disable-next-line no-console
    console.log('MongoDB connected !');
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error('MongoDB connect failed, retry in 10 seconds');
    await new Promise((accept) => {
      setTimeout(accept, 10000);
    });
    await connect(config);
  }
};
export default connect;
