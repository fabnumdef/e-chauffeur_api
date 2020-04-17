import Pattern from '../../models/pattern';

export const generateDummyPattern = (params) => ({ ...params });

export const createDummyPattern = async (params) => Pattern.create(generateDummyPattern(params));

export default Pattern;
