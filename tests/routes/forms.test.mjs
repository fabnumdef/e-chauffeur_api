import nanoid from 'nanoid';
import mongoose from 'mongoose';
import User, { generateDummyUser } from '../models/user';
import request from '../request';

describe('Test /forms/rating API endpoint', () => {
  const PASSWORD = 'foobar';
  const user = new User(generateDummyUser({ password: PASSWORD }));
  const token = user.emitJWT();

  it('Should return 400 if required datas are missing in request body', async () => {
    const arrayOfTests = [
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

    await Promise.all(arrayOfTests.map(async (args) => {
      await request()
        .post('/forms/rating')
        .set('Authorization', `Bearer ${token}`)
        .send(args)
        .expect(400);
    }));
  });

  it('Should return 204', async () => {
    const id = mongoose.Types.ObjectId().toString();
    const args = {
      rideId: id,
      uxGrade: 3,
      recommandationGrade: 2,
    };
    await request()
      .post('/forms/rating')
      .set('Authorization', `Bearer ${token}`)
      .send(args)
      .expect(204);
  });
});
