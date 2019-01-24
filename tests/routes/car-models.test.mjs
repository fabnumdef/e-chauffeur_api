import chai from 'chai';
import request from '../request';
import CarModel from '../../models/car-model';

const { expect } = chai;

// Init witness record
const objectWitness = {};
objectWitness.id = 'BRL_CAR_MOD_999999';
objectWitness.label = 'RENAULT ZOE';

/**
 * Compares objects passed in parameters
 * @param _ObjectReturn Returned object
 * @param _ObjectWitness Witness object
 * @returns {boolean} true = equal, false = not equal
 */
function compObject(_ObjectReturn, _ObjectWitness)
{
  return _ObjectReturn._id === _ObjectWitness.id
    && _ObjectReturn.label === _ObjectWitness.label;
}

/**
 * Creating the instance used for the unit test
 */
async function createRec()
{
  const rec = await CarModel.findById('BRL_CAR_MOD_999999').lean();
  if (rec == null) {
    await CarModel.create({ _id: 'BRL_CAR_MOD_999999', label: 'RENAULT ZOE' });
  }
}

/**
 * Deleting the instance used for the unit test
 */
async function deleteRec()
{
  const rec = await CarModel.findById('BRL_CAR_MOD_999999').lean();
  if (rec != null) {
    await CarModel.deleteOne({ _id: 'BRL_CAR_MOD_999999' });
  }
}

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
       label: 'RENAULT ZOE',
     });
     expect(response.statusCode).to.equal(200);
     const objectReturn = await CarModel.findById('BRL_CAR_MOD_999999').lean();
     expect(compObject(objectReturn, objectWitness)).to.equal(true);
     await deleteRec();
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
    const objectReturn = await CarModel.findById('BRL_CAR_MOD_999999').lean();
    expect(compObject(objectReturn, objectWitness)).to.equal(true);
    await deleteRec();
    console.log("Test of PATCH methode terminated\n\n");
  });

  // ==========================================
  // Test the reading of a car model
  // ==========================================
  it('It should response the GET method', async () => {
    console.log("Test of GET methode beginned");
    await createRec();
    const response = await request().get('/car-models/?mask=*');
    expect(response.statusCode).to.equal(200);

    // var table = new Array();
    // table = response.body;
    var table = response.body;
    var found = table.find(function(element) {
      return element.id === 'BRL_CAR_MOD_999999';
    });
    expect(found).to.not.equal(undefined);
    await deleteRec();
    console.log("Test of GET methode terminated\n\n");
  });

  // ==========================================
  // Test the reading of a car model by its ID
  // ==========================================
  it('It should response the GET by ID method', async () => {
    console.log("Test of GET by ID methode beginned");
    await createRec();
    const response = await request().get('/car-models/BRL_CAR_MOD_999999?mask=*');
    expect(response.statusCode).to.equal(200);
    const objectReturn = await CarModel.findById('BRL_CAR_MOD_999999').lean();
    expect(compObject(objectReturn, objectWitness)).to.equal(true);
    await deleteRec();
    console.log("Test of GET by ID methode terminated\n\n");
  });

  // ==========================================
  // Test the removal of a car model by its ID
  // ==========================================
  it('It should response the DELETE method', async () => {
    console.log("Test of DELETE methode beginned");
    await createRec();
    const response = await request().delete('/car-models/BRL_CAR_MOD_999999').send({
    });
    expect(response.statusCode).to.equal(204);
    const objectReturn = await CarModel.findById('BRL_CAR_MOD_999999').lean();
    expect(objectReturn).to.equal(null);
    console.log("Test of DELETE methode terminated\n\n");
  });
});
