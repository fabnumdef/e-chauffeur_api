import chai from 'chai';
import request from '../request';

const { expect } = chai;

describe('Test the car models', () => {
  // it('It should response the POST method', async () => {
  //   const response = await request().post('/campuses').send({
  //     id: 'TEST_TEXT_ID',
  //     name: 'name',
  //   });
  //   expect(response.statusCode).to.equal(200);
  // });

  it('It should response the GET method', async () => {
    const response = await request().get('/car-models');
    expect(response.statusCode).to.equal(200);
  });

  // Test create of a car-models
});
