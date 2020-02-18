import nanoid from 'nanoid';
import { ARRIVAL } from './types';
import { VALIDATED, WAITING } from '../../models/status';

export default class Step {
  constructor(type, ride) {
    this.id = nanoid();
    this.rideId = [ride.id];
    this.type = type;
    this.date = type === ARRIVAL ? ride.end : ride.start;
    this.destination = type === ARRIVAL ? ride.arrival.label : ride.departure.label;
    this.status = type === ARRIVAL ? WAITING : VALIDATED;
    this.phone = [ride.phone];
    this.generatePassengerCount(ride.passengersCount);
    this.generateDetails(
      ride.comments,
      ride.luggage,
    );
  }

  generatePassengerCount(passengersCount) {
    let key;
    if (this.type === ARRIVAL) {
      key = `Dépôt de passager${passengersCount > 1 ? 's' : ''}`;
    } else {
      key = `Prise en charge de passager${passengersCount > 1 ? 's' : ''}`;
    }
    this.passengersCount = {
      key,
      value: passengersCount,
    };
  }

  generateDetails(comments, luggage) {
    const details = [];
    if (comments) {
      details.push({
        key: 'Commentaire',
        value: comments,
      });
    }
    if (luggage) {
      details.push({
        key: 'Présence de bagages',
        value: 'Oui',
      });
    }
    this.details = details;
  }
}
