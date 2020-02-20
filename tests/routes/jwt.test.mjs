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

  it('It should gain access on generate via uniq token', async () => {
    const PASSWORD = 'foobarbaz';
    const user = await createDummyUser({ password: PASSWORD });
    const { token: resetToken } = await user.generateResetToken({ email: user.email });
    await user.save();
    try {
      const { body: { token }, statusCode } = await request()
        .post('/jwt/generate')
        .query({ mask: 'token' })
        .send({
          email: user.email,
          token: resetToken,
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

  it('It should block access on generate via token after 3 failures', async () => {
    const MAX_RETRY = 3;
    const PASSWORD = 'foobarbaz';
    const user = await createDummyUser({ password: PASSWORD });
    const { token } = await user.generateResetToken({ email: user.email });
    await user.save();
    try {
      // eslint-disable-next-line no-restricted-syntax
      for (const i of [...Array(MAX_RETRY).keys()]) {
        // eslint-disable-next-line no-await-in-loop
        const { tokens } = await User.findById(user.id);
        expect(tokens.find((r) => r.token === token).attempts.length).to.equal(i);
        // eslint-disable-next-line no-await-in-loop
        const { statusCode } = await request()
          .post('/jwt/generate')
          .query({ mask: 'token' })
          .send({
            email: user.email,
            // 0 is not in token alphabet, so it's not possible to get a real token with 0 inside
            token: '000000',
          });
        expect(statusCode).to.equal(403);
      }
      const { tokens } = await User.findById(user.id);
      expect(tokens.find((r) => r.token === token)).to.be.undefined;
    } finally {
      await user.deleteOne();
    }
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
