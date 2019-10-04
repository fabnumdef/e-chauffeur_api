import chai from 'chai';
import request from '../request';

const { expect } = chai;

describe('Test the / route', () => {
  it('It should response the GET method', async () => {
    const { text, statusCode } = await request()
      .get('/');
    expect(statusCode).to.equal(200);
    expect(text).to.match(/^OK/);
  });
});
