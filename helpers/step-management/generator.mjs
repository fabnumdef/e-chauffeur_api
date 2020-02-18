import {
  DELIVERED,
  STARTED, VALIDATED,
} from '../../models/status';
import { DEPARTURE, ARRIVAL } from './types';
import Step from './schema';

export default (ride) => {
  const steps = [];
  if (ride.status !== DELIVERED) {
    steps.push(new Step(ARRIVAL, ride));

    const shouldGenerateDualStep = ride.status === VALIDATED || ride.status === STARTED;
    if (shouldGenerateDualStep) {
      steps.push(new Step(DEPARTURE, ride));
    }
  }
  return steps;
};
