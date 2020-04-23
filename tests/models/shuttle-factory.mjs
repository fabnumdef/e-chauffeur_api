import ShuttleFactory from '../../models/shuttle-factory';

export const generateDummyShuttleFactory = (params) => ({ ...params });

export const createDummyShuttleFactory = async (params) => ShuttleFactory.create(generateDummyShuttleFactory(params));

export default ShuttleFactory;
