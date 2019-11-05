import chai from 'chai';
import nanoid from 'nanoid';
import mongoose from 'mongoose';
import User, { generateDummyUser } from '../models/user';
import request from '../request';
import Rating from '../models/rating';

const { expect } = chai;

describe('Test /forms/rating API endpoint', () => {
  const PASSWORD = 'foobar';
  const user = new User(generateDummyUser({ password: PASSWORD }));
  const token = user.emitJWT();

  it('Should return 400 if required datas are missing in request body', async () => {
    const arrayOfArgs = [
      {
        uxGrade: 3,
        recommandationGrade: 2,
      },
      {
        rideId: nanoid(),
        recommandationGrade: 2,
      },
      {
        rideId: nanoid(),
        uxGrade: 2,
      },
    ];

    await Promise.all(arrayOfArgs.map(async (args) => {
      await request()
        .post('/forms/rating')
        .set('Authorization', `Bearer ${token}`)
        .send(args)
        .expect(400);
    }));
  });

  it('Should return 204', async () => {
    const args = {
      rideId: mongoose.Types.ObjectId().toString(),
      uxGrade: 3,
      recommandationGrade: 2,
    };
    await request()
      .post('/forms/rating')
      .set('Authorization', `Bearer ${token}`)
      .send(args)
      .expect(204);
  });

  it('Should create a rating in database', async () => {
    const id = nanoid();
    const args = {
      rideId: mongoose.Types.ObjectId().toString(),
      uxGrade: 3,
      recommandationGrade: 2,
      message: `This is a message with a unique id : ${id}`,
    };
    await request()
      .post('/forms/rating')
      .set('Authorization', `Bearer ${token}`)
      .send(args);

    const testRating = await Rating.findOne({ message: `This is a message with a unique id : ${id}` });
    expect(testRating).to.be.an.instanceof(Rating);
  });
});
