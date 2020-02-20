import {
  CREATED,
  DELIVERED,
  STARTED, VALIDATED,
} from '../../models/status';
import { DEPARTURE, ARRIVAL } from './types';
import Step from './schema';
import { isToday } from '../date-helpers';

export default (ride) => {
  const steps = [];
  if (ride.status !== DELIVERED && isToday(ride.start)) {
    const shouldGenerateDualStep = ride.status === CREATED || ride.status === VALIDATED || ride.status === STARTED;
    if (shouldGenerateDualStep) {
      steps.push(new Step(DEPARTURE, ride));
    }
    steps.push(new Step(ARRIVAL, ride));
  }
  return steps;
};
