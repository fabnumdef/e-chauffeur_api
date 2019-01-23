import chai from 'chai';
import request from '../request';

const { expect } = chai;

describe('Test the car models', () => {
  // Test the creation of a car model
  it('It should response the POST method', async () => {
     const response = await request().post('/car-models').send({
       // ID Car-model
       id: 'BRL_CAR_MOD_999999',
       //
       label: 'RENAULT ZO',
     });
     expect(response.statusCode).to.equal(200);
  });

  // Test the update of a car model
  it('It should response the PATCH method', async () => {
    const response = await request().patch('/car-models/BRL_CAR_MOD_999999').send({
      // ID Car-model
      id: 'BRL_CAR_MOD_999999',
      //
      label: 'RENAULT ZOE',
    });
    expect(response.statusCode).to.equal(200);
  });

  // Test the reading of a car model
  it('It should response the GET method', async () => {
    const response = await request().get('/car-models');
    expect(response.statusCode).to.equal(200);
  });

  // Test the reading of a car model by its ID
  it('It should response the GET method', async () => {
    const response = await request().get('/car-models/BRL_CAR_MOD_999999');
    expect(response.statusCode).to.equal(200);
  });

});
