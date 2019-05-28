import chai from 'chai';
import request from '../../request';
import { defaultRouteName } from './common';

const { expect } = chai;

export const testGet = (Model, {
  canCall = [],
  cannotCall = [],
  route = ({ id }) => `/${defaultRouteName(Model)}/${encodeURIComponent(id)}`,
  generateDummyObject = () => ({}),
} = {}) => [
  'It should only authorize get when authenticated user has enough rights',
  async () => {
    const expectGet = async (roleGenerator) => {
      const dummyObject = await generateDummyObject();
      const createdObject = await Model.create(dummyObject);

      const { statusCode } = await request()
        .get(typeof route === 'function' ? route(createdObject) : route)
        .set(...roleGenerator());

      const object = await Model.findOne(createdObject.toObject());
      if (object) {
        await object.remove();
      }

      return {
        statusCode: expect(statusCode),
        foundObject: expect(object),
      };
    };

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
