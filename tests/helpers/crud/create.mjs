import chai from 'chai';
import request from '../../request';
import { cleanObject } from '../../../middlewares/mask-output';
import { defaultRouteName } from './common';

const { expect } = chai;

export const testCreate = (Model, {
  canCall = [],
  cannotCall = [],
  route = `/${defaultRouteName(Model)}`,
  generateDummyObject = () => ({}),
} = {}) => [
  'It should only authorize creation when authenticated user has enough rights',
  async () => {
    const expectCreate = async (roleGenerator) => {
      const [dummyObject, toDropLater = []] = [].concat(await generateDummyObject());
      const { body: { id }, statusCode } = await request()
        .post(route)
        .query({ mask: 'id' })
        .set(...roleGenerator())
        .send(cleanObject(dummyObject));

      const object = await Model
        .findById(id);
      if (object) {
        await object.remove();
        await Promise.all(toDropLater.map(entity => entity.remove()));
      }

      return {
        statusCode: expect(statusCode),
        foundObject: expect(object),
      };
    };

    await Promise.all([
      ...canCall.map(async (roleGenerator) => {
        const { statusCode, foundObject } = await expectCreate(roleGenerator);
        statusCode.to.equal(200);
        foundObject.to.not.be.null;
      }),

      ...cannotCall.map(async (roleGenerator) => {
        const { statusCode, foundObject } = await expectCreate(roleGenerator);
        statusCode.to.equal(403);
        foundObject.to.be.null;
      }),
    ]);
  },
];
export const testCreateUnicity = (Model, {
  generateDummyObject,
  requestCallBack = r => r,
  transformObject = { id: '_id' },
  route = `/${defaultRouteName(Model)}`,
} = {}) => [
  `Only one ${Model.modelName} should be able to be created with same parameters`,
  async () => {
    const rawDummyObject = await generateDummyObject();
    const dummyObject = new Model(rawDummyObject);
    const getRequest = () => (requestCallBack(request().post(route))
      .query({ mask: Object.keys(transformObject).join(',') })
      .send(
        Object.keys(transformObject)
          .map(k => ({ [k]: dummyObject[transformObject[k]] }))
          .reduce((acc, cur) => Object.assign(acc, cur), {}),
      ));
    try {
      {
        const { body, statusCode } = await getRequest();

        expect(statusCode).to.equal(200);

        // eslint-disable-next-line no-restricted-syntax
        for (const key of Object.keys(transformObject)) {
          expect(body[key]).to.equal(dummyObject[transformObject[key]]);
        }

        const objectFound = await Model
          .findOne(rawDummyObject)
          .lean();
        expect(objectFound).to.not.be.null;
      }
      {
        const { statusCode } = await getRequest();
        expect(statusCode).to.equal(409);
      }
    } finally {
      await dummyObject.remove();
    }
  },
];
