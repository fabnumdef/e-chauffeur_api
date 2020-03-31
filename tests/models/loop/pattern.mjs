import nanoid from 'nanoid';
import LoopPattern from '../../../models/loop/pattern';

export const generateDummyLoopPattern = (params) => ({
  label: nanoid(),
  ...params,
});

export const createDummyLoopPattern = (params) => LoopPattern.create(generateDummyLoopPattern(params));

export default LoopPattern;
