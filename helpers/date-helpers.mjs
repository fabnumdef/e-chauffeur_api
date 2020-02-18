import Luxon from 'luxon';

const { DateTime } = Luxon;

export const sortByDate = (array) => array.sort((a, b) => {
  const startA = a.date;
  const startB = b.date;

  if (startA < startB) {
    return -1;
  }
  if (startA > startB) {
    return 1;
  }
  return 0;
});

export const isToday = (date) => {
  const today = new Date();

  return date.getDate() === today.getDate()
    && date.getMonth() === today.getMonth()
    && date.getFullYear() === today.getFullYear();
};
