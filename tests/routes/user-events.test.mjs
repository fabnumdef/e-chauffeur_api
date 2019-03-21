import chai from 'chai';
import request from '../request';
import { cleanObject } from '../../middlewares/mask-output';
import UserEvent, { generateDummyUserEvent } from '../models/user-event';
import { createDummyUser } from '../models/user';

const { expect } = chai;

describe('Test the user events API endpoint', () => {
  it('POST API endpoint should create a new user-event', async () => {
    const toDropLater = [];

    const user = await createDummyUser();
    toDropLater.push(user);

    const dummyUserEvent = generateDummyUserEvent({ user });
    try {
      {
        const response = await request()
          .post('/user-events')
          .send(cleanObject(dummyUserEvent));
        expect(response.statusCode).to.equal(200);

        const userEvent = await UserEvent
          .find(dummyUserEvent)
          .lean();
        expect(userEvent).to.not.be.null;
      }
      {
        const { statusCode } = await request()
          .post('/user-events')
          .send(cleanObject(dummyUserEvent));
        expect(statusCode).to.equal(409);
      }
    } finally {
      await Promise.all(toDropLater.map(entity => entity.remove()));
      await UserEvent.deleteOne({ _id: dummyUserEvent._id });
    }
  });
});
