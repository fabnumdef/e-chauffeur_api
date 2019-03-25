import chai from 'chai';
import request, { generateRegulatorJWTHeader, generateSuperAdminJWTHeader } from '../request';
import { cleanObject } from '../../middlewares/mask-output';
import CarModel, { generateDummyCarModel } from '../models/car-model';

const { expect } = chai;

describe('Test the car models API endpoint', () => {
  it('POST API endpoint should create a new car-model', async () => {
    const dummyCarModel = generateDummyCarModel();
    try {
      {
        const response = await request()
          .post('/car-models')
          .set(...generateSuperAdminJWTHeader())
          .send(cleanObject(dummyCarModel));
        expect(response.statusCode).to.equal(200);

        const carModel = await CarModel
          .find(dummyCarModel)
          .lean();
        expect(carModel).to.not.be.null;
      }
      {
        const { statusCode } = await request()
          .post('/car-models')
          .set(...generateSuperAdminJWTHeader())
          .send(cleanObject(dummyCarModel));
        expect(statusCode).to.equal(409);
      }
    } finally {
      await CarModel.deleteOne({ _id: dummyCarModel._id });
    }
  });

  it('PATCH API endpoint should edit an existing car-model', async () => {
    const dummyCarModel = generateDummyCarModel();
    const NEW_LABEL = 'New Label';
    try {
      const carModel = await CarModel.create(dummyCarModel);

      const response = await request()
        .patch(`/car-models/${encodeURIComponent(carModel.id)}`)
        .set(...generateSuperAdminJWTHeader())
        .send({ label: NEW_LABEL });
      expect(response.statusCode).to.equal(200);

      const editedCarModel = await CarModel.findById(dummyCarModel._id).lean();
      expect(editedCarModel.label).to.equal(NEW_LABEL);
    } finally {
      await CarModel.deleteOne({ _id: dummyCarModel._id });
    }
  });

  it('GET API endpoint should list existing car-models', async () => {
    const dummyCarModel = generateDummyCarModel();
    try {
      await CarModel.create(dummyCarModel);
      const response = await request()
        .get('/car-models/?mask=*')
        .set(...generateRegulatorJWTHeader());
      expect(response.statusCode).to.equal(200);
      const found = response.body.find(({ id }) => id === dummyCarModel._id);
      expect(found).to.deep.equal(cleanObject(dummyCarModel));
    } finally {
      await CarModel.deleteOne({ _id: dummyCarModel._id });
    }
  });

  it('GET API endpoint should return existing car-model', async () => {
    const dummyCarModel = generateDummyCarModel();
    try {
      const carModel = await CarModel.create(dummyCarModel);
      const response = await request()
        .get(`/car-models/${encodeURIComponent(carModel.id)}?mask=*`)
        .set(...generateRegulatorJWTHeader());
      expect(response.statusCode).to.equal(200);

      expect(response.body).to.deep.equal(cleanObject(dummyCarModel));
    } finally {
      await CarModel.deleteOne({ _id: dummyCarModel._id });
    }
  });

  it('DELETE API endpoint should remove existing car-model', async () => {
    const dummyCarModel = generateDummyCarModel();
    try {
      const carModel = await CarModel.create(dummyCarModel);
      const response = await request()
        .delete(`/car-models/${encodeURIComponent(carModel.id)}`)
        .set(...generateSuperAdminJWTHeader());
      expect(response.statusCode).to.equal(204);

      const objectReturn = await CarModel.findById(dummyCarModel._id).lean();
      expect(objectReturn).to.equal(null);
    } finally {
      await CarModel.deleteOne({ _id: dummyCarModel._id });
    }
  });
});
