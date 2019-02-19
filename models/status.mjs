export const CREATED = 'created';
export const VALIDATED = 'validated'; // Regulation validation
export const REJECTED_BOUNDARY = 'rejected_boundary'; // Regulation validation
export const REJECTED_CAPACITY = 'rejected_capacity'; // Regulation validation
export const ACCEPTED = 'accepted'; // Driver acceptance
export const DECLINED_DAMAGE = 'declined_damage'; // Driver rejection
export const DECLINED_TRAFFIC = 'declined_traffic'; // Driver rejection
export const DECLINED_NOBODY = 'declined_nobody'; // Driver rejection
export const STARTED = 'started';
export const WAITING = 'waiting';
export const IN_PROGRESS = 'progress';
export const DELIVERED = 'delivered';
export const DONE = 'done';
export const CANCELED = 'canceled';

export const VALIDATE = 'validation';
export const REJECT_BOUNDARY = 'rejection_boundary';
export const REJECT_CAPACITY = 'rejection_capacity';
export const ACCEPT = 'accept';
export const DECLINE_DAMAGE = 'decline_damage';
export const DECLINE_TRAFFIC = 'decline_traffic';
export const DECLINE_NOBODY = 'decline_nobody';
export const START = 'start-up';
export const WAIT = 'stay';
export const PROGRESS = 'progress';
export const DELIVER = 'deliver';
export const FINISH = 'finish';
export const CANCEL = 'void';

export default {
  init: CREATED,
  transitions: [
    { name: VALIDATE, from: CREATED, to: VALIDATED },
    { name: REJECT_BOUNDARY, from: CREATED, to: REJECTED_BOUNDARY },
    { name: REJECT_CAPACITY, from: CREATED, to: REJECTED_CAPACITY },
    { name: ACCEPT, from: VALIDATED, to: ACCEPTED },
    { name: DECLINE_DAMAGE, from: VALIDATED, to: DECLINED_DAMAGE },
    { name: DECLINE_TRAFFIC, from: VALIDATED, to: DECLINED_TRAFFIC },
    { name: DECLINE_NOBODY, from: VALIDATED, to: DECLINED_NOBODY },
    { name: START, from: ACCEPTED, to: STARTED },
    { name: WAIT, from: STARTED, to: WAITING },
    { name: PROGRESS, from: WAITING, to: IN_PROGRESS },
    { name: DELIVER, from: IN_PROGRESS, to: DELIVERED },
    { name: FINISH, from: DELIVERED, to: DONE },
    { name: CANCEL, from: [ACCEPTED, STARTED, WAITING, IN_PROGRESS, DELIVERED], to: CANCELED },
  ],

  methods: {
    onEnterState({ from, to }) {
      if (from === this.status) {
        this.statusChanges.push({
          status: to,
          time: new Date(),
        });
      }
    },
  },
};
