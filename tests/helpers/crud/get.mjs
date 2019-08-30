import chai from 'chai';
import request from '../../request';
import { defaultRouteName } from './common';

const { expect } = chai;

/* eslint-disable-next-line import/prefer-default-export */
export const testGet = (Model, {
  canCall = [],
  cannotCall = [],
  route = ({ id }) => `/${defaultRouteName(Model)}/${encodeURIComponent(id)}`,
  queryParams = {},
  generateDummyObject = () => ({}),
} = {}) => [
  'It should only authorize get when authenticated user has enough rights',
  async () => {
    const expectGet = async (roleGenerator, id) => {
      const [dummyObject, toDropLater = []] = [].concat(await generateDummyObject());
      const createdObject = await Model.create(dummyObject);

      const { statusCode } = await request()
        .get(typeof route === 'function' ? route(id ? { id } : createdObject) : route)
        .query(queryParams)
        .set(...roleGenerator());

      const object = await Model.findOne(createdObject.toObject());
      if (object) {
        await object.remove();
      }
      await Promise.all(toDropLater.map((entity) => entity.remove()));

      return {
        statusCode: expect(statusCode),
        foundObject: expect(object),
      };
    };

    if (canCall.length > 0) {
      const { statusCode } = await expectGet(canCall[0], 'not-existing');
      statusCode.to.equal(404);
    }
    await Promise.all([
      ...canCall.map(async (roleGenerator) => {
        const { statusCode, foundObject } = await expectGet(roleGenerator);
        statusCode.to.equal(200);
        foundObject.to.not.be.null;
      }),

      ...cannotCall.map(async (roleGenerator) => {
        const { statusCode } = await expectGet(roleGenerator);
        statusCode.to.equal(403);
      }),
    ]);
  },
];
