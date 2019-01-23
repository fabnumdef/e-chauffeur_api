import chai from 'chai';
import request from '../request';
import CarModel from "../../models/car-model";

const { expect } = chai;

describe('Test the car models', () => {

  // ==========================================
  // Test the creation of a car model
  // ==========================================
  it('It should response the POST method', async () => {
     console.log("Test of POST methode beginned");
     const response = await request().post('/car-models').send({
       // ID Car-model
       id: 'BRL_CAR_MOD_999999',
       //
       label: 'RENAULT ZO',
     });
     expect(response.statusCode).to.equal(200);
     const JsonObjectReturn = await CarModel.findById('BRL_CAR_MOD_999999').lean();
     const JsonObjectWitness = {};
     JsonObjectWitness.id = 'BRL_CAR_MOD_999999';
     JsonObjectWitness.label = 'RENAULT ZOE';
     expect(JsonObjectReturn.toString()).to.equal(JsonObjectWitness.toString());
     await CarModel.deleteOne({ _id: 'BRL_CAR_MOD_999999' });
     console.log("Test of POST methode terminated\n\n");
  });

  // ==========================================
  // Test the update of a car model
  // ==========================================
  it('It should response the PATCH method', async () => {
    console.log("Test of PATCH methode beginned");
    await CarModel.create({ _id: 'BRL_CAR_MOD_999999', label: 'RENAULT Z' });
    const response = await request().patch('/car-models/BRL_CAR_MOD_999999').send({
      // ID Car-model
      id: 'BRL_CAR_MOD_999999',
      //
      label: 'RENAULT ZOE',
    });
    expect(response.statusCode).to.equal(200);
    const JsonObjectReturn = await CarModel.findById('BRL_CAR_MOD_999999').lean();
    const JsonObjectWitness = {};
    JsonObjectWitness.id = 'BRL_CAR_MOD_999999';
    JsonObjectWitness.label = 'RENAULT ZOE';
    expect(JsonObjectReturn.toString()).to.equal(JsonObjectWitness.toString());
    await CarModel.deleteOne({ _id: 'BRL_CAR_MOD_999999' });
    console.log("Test of PATCH methode terminated\n\n");
  });

  // ==========================================
  // Test the reading of a car model
  // ==========================================
  it('It should response the GET method', async () => {
    const response = await request().get('/car-models/?mask=*');
    expect(response.statusCode).to.equal(200);
  });

  // ==========================================
  // Test the reading of a car model by its ID
  // ==========================================
  it('It should response the GET by ID method', async () => {
    console.log("Test of GET by ID methode beginned");
    await CarModel.create({ _id: 'BRL_CAR_MOD_999999', label: 'RENAULT ZOE' });
    const response = await request().get('/car-models/BRL_CAR_MOD_999999?mask=*');
    expect(response.statusCode).to.equal(200);
    const JsonObjectReturn = await CarModel.findById('BRL_CAR_MOD_999999').lean();
    const JsonObjectWitness = {};
    JsonObjectWitness.id = 'BRL_CAR_MOD_999999';
    JsonObjectWitness.label = 'RENAULT ZOE';
    expect(JsonObjectReturn.toString()).to.equal(JsonObjectWitness.toString());
    await CarModel.deleteOne({ _id: 'BRL_CAR_MOD_999999' });
    console.log("Test of GET by ID methode terminated\n\n");
  });

  // ==========================================
  // Test the removal of a car model by its ID
  // ==========================================
  it('It should response the DELETE method', async () => {
    console.log("Test of DELETE methode beginned");
    await CarModel.create({ _id: 'BRL_CAR_MOD_999999', label: 'RENAULT ZOE' });
    const response = await request().delete('/car-models/BRL_CAR_MOD_999999').send({
    });
    expect(response.statusCode).to.equal(204);
    const JsonObjectReturn = await CarModel.findById('BRL_CAR_MOD_999999').lean();
    expect(JsonObjectReturn).to.equal(null);
    console.log("Test of DELETE methode terminated\n\n");
  });
});
