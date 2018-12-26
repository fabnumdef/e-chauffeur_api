export const CREATED = 'created';
export const ACCEPTED = 'accepted';
export const DECLINED = 'declined';
export const WAITING = 'waiting';
export const IN_PROGRESS = 'progress';
export const DELIVERED = 'delivered';
export const DONE = 'done';
export const CANCELED = 'canceled';

export default {
  init: CREATED,
  transitions: [
    { name: 'accept', from: CREATED, to: ACCEPTED },
    { name: 'decline', from: CREATED, to: DECLINED },
    { name: 'wait', from: ACCEPTED, to: WAITING },
    { name: 'start', from: WAITING, to: IN_PROGRESS },
    { name: 'deliver', from: IN_PROGRESS, to: DELIVERED },
    { name: 'end', from: DELIVERED, to: DONE },
    { name: 'cancel', from: [ACCEPTED, WAITING, IN_PROGRESS, DELIVERED], to: CANCELED },
  ],

  methods: {
  },
};
