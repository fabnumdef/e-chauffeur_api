import chai from 'chai';
import jwt from 'jsonwebtoken';
import request from '../request';
import { createDummyUser } from '../models/user';
import config from "../../services/config";

const { expect } = chai;

describe('Test the JWT route', () => {
  describe('Test the generate route', () => {
    it('It should return 404 if user not found', async () => {
      const { statusCode } = await request()
        .post('/jwt/generate')
        .send({
          email: 'foo@bar.com',
          password: 'foobar',
        });
      expect(statusCode).to.equal(404);
    });

    it('It should return 403 if bad password', async () => {
      const { statusCode } = await request()
        .post('/jwt/generate')
        .send({
          email: 'foo@bar.com',
          password: 'foobar',
        });
      expect(statusCode).to.equal(404);
    });

    it('It should return a valid token on generate', async () => {
      const PASSWORD = 'foobar';
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
        await user.remove();
      }
    });

    it('It should return a valid token on generate', async () => {
      const PASSWORD = 'foobar';
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
        await user.remove();
      }
    });
  });
});
