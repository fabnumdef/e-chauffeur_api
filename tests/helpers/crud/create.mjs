import chai from 'chai';
import request from '../../request';
import { cleanObject } from '../../../middlewares/mask-output';
import { defaultRouteName } from './common';

const { expect } = chai;

export const testCreate = (Model, {
  canCall = [],
  cannotCall = [],
  route = `/${defaultRouteName(Model)}`,
  queryParams = {},
  generateDummyObject = () => ({}),
  expectedStatus = 200,
} = {}) => [
  'It should only authorize creation when authenticated user has enough rights',
  async () => {
    const expectCreate = async (roleGenerator) => {
      const [dummyObject, toDropLater = []] = [].concat(await generateDummyObject());
      const { body: { id }, statusCode } = await request()
        .post(route)
        .query({ ...queryParams, mask: 'id' })
        .set(...roleGenerator())
        .send(cleanObject(dummyObject));
      const object = await Model
        .findById(id);
      if (object) {
        await object.deleteOne();
      }
      await Promise.all(toDropLater.map((entity) => entity.deleteOne()));

      return {
        statusCode: expect(statusCode),
        foundObject: expect(object),
      };
    };

    await Promise.all([
      ...canCall.map(async (roleGenerator) => {
        const { statusCode, foundObject } = await expectCreate(roleGenerator);
        statusCode.to.equal(expectedStatus);
        if (expectedStatus !== 204) {
          foundObject.to.not.be.null;
        }
      }),

      ...cannotCall.map(async (roleGenerator) => {
        const { statusCode, foundObject } = await expectCreate(roleGenerator);
        statusCode.to.equal(403);
        foundObject.to.be.null;
      }),
    ]);
  },
];

function transform(config, data) {
  return Object.keys(config)
    .map((k) => ({ [k]: typeof config[k] === 'object' ? transform(config[k], data[k]) : data[config[k]] }))
    .reduce((acc, cur) => Object.assign(acc, cur), {});
}

export const testCreateUnicity = (Model, {
  generateDummyObject,
  requestCallBack = (r) => r,
  transformObject = { id: '_id' },
  queryParams = {},
  route = `/${defaultRouteName(Model)}`,
} = {}) => [
  `Only one ${Model.modelName} should be able to be created with same parameters`,
  async () => {
    const [rawDummyObject, toDropLater = []] = [].concat(await generateDummyObject());
    const dummyObject = new Model(rawDummyObject);
    const getRequest = () => requestCallBack(request().post(route))
      .query({ ...queryParams, mask: Object.keys(transformObject).join(',') })
      .send(transform(transformObject, dummyObject));

    try {
      {
        const { body, statusCode } = await getRequest();

        expect(statusCode).to.equal(200);

        // eslint-disable-next-line no-restricted-syntax
        for (const key of Object.keys(transformObject)) {
          // @todo: Remove next condition, deep check object
          if (typeof transformObject[key] === 'string') {
            expect(body[key]).to.equal(dummyObject[transformObject[key]]);
          }
        }

        const objectFound = await Model
          .findById(rawDummyObject._id)
          .lean();
        expect(objectFound).to.not.be.null;
      }
      {
        const { statusCode } = await getRequest();
        expect(statusCode).to.equal(409);
      }
    } finally {
      await dummyObject.deleteOne();
      await Promise.all(toDropLater.map((entity) => entity.deleteOne()));
    }
  },
];
