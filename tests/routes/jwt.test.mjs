import chai from 'chai';
import jwt from 'jsonwebtoken';
import request from '../request';
import User, { createDummyUser, generateDummyUser } from '../models/user';
import config from '../../services/config';

const { expect } = chai;

describe('Test the JWT route', () => {
  describe('Test the generate route', () => {
    it('It should return 404 if user not found', async () => {
      const { statusCode } = await request()
        .post('/jwt/generate')
        .send({
          email: 'foo@bar.com',
          password: 'foobarbaz',
        });
      expect(statusCode).to.equal(403);
    });

    it('It should return 403 if bad password', async () => {
      const { statusCode } = await request()
        .post('/jwt/generate')
        .send({
          email: 'foo@bar.com',
          password: 'foobarbaz',
        });
      expect(statusCode).to.equal(403);
    });

    it('It should return a valid token on generate', async () => {
      const PASSWORD = 'foobarbaz';
      const user = await createDummyUser({ password: PASSWORD });
      try {
        const { body: { token }, statusCode } = await request()
          .post('/jwt/generate')
          .query({ mask: 'token' })
          .send({
            email: user.email,
            password: PASSWORD,
          });
        expect(statusCode).to.equal(200);
        expect(
          jwt.decode(token, { secret: config.get('token:secret') }),
        )
          .to.deep.include({ email: user.email, id: user.id });
      } finally {
        await user.deleteOne();
      }
    });
  });

  describe('Test the renew route', () => {
    it('It should return an error on renew when token is invalid', async () => {
      const token = jwt.sign(
        {},
        'bad token secret',
        { expiresIn: parseInt(config.get('token:duration'), 10) },
      );

      const { statusCode } = await request()
        .post('/jwt/renew')
        .set('Authorization', `Bearer ${token}`);

      expect(statusCode).to.equal(401);
    });

    it('It should return a 404 error on renew when token user not exists', async () => {
      const PASSWORD = 'foobar';
      const user = new User(generateDummyUser({ password: PASSWORD }));
      const token = user.emitJWT();

      try {
        const { statusCode } = await request()
          .post('/jwt/renew')
          .set('Authorization', `Bearer ${token}`);
        expect(statusCode).to.equal(404);
      } finally {
        await user.deleteOne();
      }
    });

    it('It should return a valid new token on renew', async () => {
      const PASSWORD = 'foobarbaz';
      const user = await createDummyUser({ password: PASSWORD });
      const authToken = user.emitJWT();

      try {
        const { body: { token }, statusCode } = await request()
          .post('/jwt/renew')
          .query({ mask: 'token' })
          .set('Authorization', `Bearer ${authToken}`);
        expect(statusCode).to.equal(200);
        expect(
          jwt.decode(token, { secret: config.get('token:secret') }),
        )
          .to.deep.include({ email: user.email, id: user.id });
      } finally {
        await user.deleteOne();
      }
    });
  });

  describe('Test the GET user route', () => {
    it('It should return a 404 error on get user when user not exists', async () => {
      const PASSWORD = 'foobarbaz';
      const user = new User(generateDummyUser({ password: PASSWORD }));
      const token = user.emitJWT();

      try {
        const { statusCode } = await request()
          .get('/jwt/user')
          .set('Authorization', `Bearer ${token}`);
        expect(statusCode).to.equal(404);
      } finally {
        await user.deleteOne();
      }
    });

    it('It should return the user', async () => {
      const PASSWORD = 'foobarbaz';
      const u = await createDummyUser({ password: PASSWORD });
      const authToken = u.emitJWT();

      try {
        const { body: user, statusCode } = await request()
          .get('/jwt/user')
          .query({ mask: 'id,email' })
          .set('Authorization', `Bearer ${authToken}`);
        expect(statusCode).to.equal(200);
        expect(user)
          .to.deep.equal({ email: u.email, id: u.id });
      } finally {
        await u.deleteOne();
      }
    });
  });
});
