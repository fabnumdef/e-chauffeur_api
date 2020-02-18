import Luxon from 'luxon';

const { DateTime } = Luxon;

export default (steps) => steps.reduce((acc, step) => {
  const previous = acc[acc.length - 1];
  if (
    acc.length < 1
    || (
      DateTime.fromJSDate(previous.date).toISO() !== DateTime.fromJSDate(step.date).toISO()
      || previous.destination !== step.destination
    )
  ) {
    acc.push(step);
  } else {
    acc[acc.length - 1] = {
      ...previous,
      rideId: [
        ...previous.rideId,
        step.rideId,
      ],
      phone: [
        ...previous.phone,
        step.phone,
      ],
      passengersCount: {
        key: previous.passengersCount.key,
        value: previous.passengersCount.value + step.passengersCount.value,
      },
    };
  }
  return acc;
}, []);
