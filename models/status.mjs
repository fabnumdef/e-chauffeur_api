import Luxon from 'luxon';
import get from 'lodash.get';
import config from '../services/config';

const DEFAULT_TIMEZONE = config.get('default_timezone');
const { DateTime } = Luxon;

export const DRAFTED = 'drafted';
export const CREATED = 'created';
export const VALIDATED = 'validated'; // Regulation validation
export const REJECTED_BOUNDARY = 'rejected_boundary'; // Regulation validation
export const REJECTED_CAPACITY = 'rejected_capacity'; // Regulation validation
export const ACCEPTED = 'accepted'; // Driver acceptance
export const DECLINED = 'declined'; // Driver rejection
export const STARTED = 'started';
export const WAITING = 'waiting';
export const IN_PROGRESS = 'progress';
export const DELIVERED = 'delivered';
export const CANCELED = 'canceled';
export const CANCELED_TECHNICAL = 'canceled_technical';
export const CANCELED_REQUESTED_CUSTOMER = 'canceled_requested_customer';
export const CANCELED_CUSTOMER_OVERLOAD = 'canceled_customer_overload';
export const CANCELED_CUSTOMER_MISSING = 'canceled_customer_missing';
export const CANCELED_STATUSES = [
  CANCELED,
  CANCELED_TECHNICAL,
  CANCELED_REQUESTED_CUSTOMER,
  CANCELED_CUSTOMER_OVERLOAD,
  CANCELED_CUSTOMER_MISSING,
];

export const CREATE = 'create';
export const VALIDATE = 'validation';
export const REJECT_BOUNDARY = 'rejection_boundary';
export const REJECT_CAPACITY = 'rejection_capacity';
export const ACCEPT = 'accept';
export const DECLINE = 'decline';
export const START = 'start-up';
export const WAIT = 'stay';
export const PROGRESS = 'progress';
export const DELIVER = 'deliver';
export const CANCEL = 'void';
export const CANCEL_TECHNICAL = 'cancel_technical';
export const CANCEL_REQUESTED_CUSTOMER = 'cancel_requested_by_customer';
export const CANCEL_CUSTOMER_OVERLOAD = 'cancel_customer_overload';
export const CANCEL_CUSTOMER_MISSING = 'cancel_customer_missing';

export const CANCELABLE = [CREATED, VALIDATED, ACCEPTED, STARTED, WAITING, IN_PROGRESS];

export default {
  init: DRAFTED,
  transitions: [
    { name: CREATE, from: DRAFTED, to: CREATED },
    { name: VALIDATE, from: CREATED, to: VALIDATED },
    { name: REJECT_BOUNDARY, from: CREATED, to: REJECTED_BOUNDARY },
    { name: REJECT_CAPACITY, from: CREATED, to: REJECTED_CAPACITY },
    { name: ACCEPT, from: VALIDATED, to: ACCEPTED },
    { name: DECLINE, from: VALIDATED, to: DECLINED },
    { name: START, from: ACCEPTED, to: STARTED },
    { name: WAIT, from: STARTED, to: WAITING },
    { name: PROGRESS, from: WAITING, to: IN_PROGRESS },
    { name: DELIVER, from: IN_PROGRESS, to: DELIVERED },
    { name: CANCEL, from: CANCELABLE, to: CANCELED },
    { name: CANCEL_TECHNICAL, from: CANCELABLE, to: CANCELED_TECHNICAL },
    { name: CANCEL_REQUESTED_CUSTOMER, from: CANCELABLE, to: CANCELED_REQUESTED_CUSTOMER },
    { name: CANCEL_CUSTOMER_OVERLOAD, from: CANCELABLE, to: CANCELED_CUSTOMER_OVERLOAD },
    { name: CANCEL_CUSTOMER_MISSING, from: CANCELABLE, to: CANCELED_CUSTOMER_MISSING },
  ],

  methods: {
    async onEnterState({ from, to }) {
      if (from === this.status) {
        this.statusChanges.push({
          status: to,
          time: new Date(),
        });
        const show = (path) => get(this, path, '');
        const start = DateTime.fromJSDate(this.start)
          .setZone(get(this, 'campus.timezone', DEFAULT_TIMEZONE))
          .toLocaleString(DateTime.DATETIME_SHORT);
        const hasOwner = !!get(this, 'owner._id', false);
        switch (to) {
          case VALIDATED:
            await this.sendSMS(
              'Bonjour, '
              + `votre course de ${show('departure.label')} à ${show('arrival.label')} le `
              + `${start} est prise en compte.`
              + `Pour l'annuler, appelez le ${show('campus.phone.everybody')}.`,
            );
            break;
          case REJECTED_CAPACITY:
            if (hasOwner) {
              await this.sendSMS(
                'Bonjour, '
                + `malheureusement, votre course de ${show('departure.label')} à ${show('arrival.label')} le `
                + `${start} ne peut pas être assurée pour des raisons techniques ou humaines. `
                + `En cas d'ugence, appelez le ${show('campus.phone.everybody')}.`,
              );
            }
            break;
          case REJECTED_BOUNDARY:
            if (hasOwner) {
              await this.sendSMS(
                'Bonjour, '
              + `malheureusement, votre course de ${show('departure.label')} à ${show('arrival.label')} le `
              + `${start} ne semble pas être légitime, et a été refusée. `
              + `En cas d'ugence, appelez le ${show('campus.phone.everybody')}.`,
              );
            }
            break;
          case STARTED:
            await this.sendSMS(
              `Votre chauffeur est en route (${show('car.model.label')} / ${show('car.id')}). `
              + `Suivez son arrivée : ${this.getRideClientURL()}`,
            );
            break;
          case WAITING:
            await this.sendSMS(
              `Votre chauffeur ${show('driver.firstname')} est arrivé au point de rencontre.`,
            );
            break;
          case DELIVERED:
            await this.sendSMS(
              'Merci d\'avoir fait appel à notre offre de mobilité. '
              + `Vous pouvez évaluer le service e-Chauffeur : ${this.getSatisfactionQuestionnaireURL()}`,
            );
            break;
          case CANCELED_TECHNICAL:
            await this.sendSMS(
              `Un problème technique nous oblige à annuler votre course vers ${show('arrival.label')} `
              + `le ${start}.`,
            );
            break;
          case CANCELED_REQUESTED_CUSTOMER:
            await this.sendSMS(
              `Nous confirmons l'annulation de la course vers ${show('arrival.label')} `
              + `le ${start}.`,
            );
            break;
          case CANCELED_CUSTOMER_MISSING:
            await this.sendSMS(
              `Suite à votre absence, votre course vers ${show('arrival.label')} `
              + `le ${start} a été annulée.`,
            );
            break;
          case CANCELED_CUSTOMER_OVERLOAD:
            await this.sendSMS(
              'Suite à une surcharge du service, '
              + `nous somme dans l'obligation d'annuler votre course en direction de ${show('arrival.label')} `
              + `le ${start}.`,
            );
            break;
          default:
            break;
        }
      }
    },
  },
};
