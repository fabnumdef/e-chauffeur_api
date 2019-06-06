import chai from 'chai';
import request from '../../request';
import { defaultRouteName } from './common';

const { expect } = chai;

export const testDelete = (Model, {
  canCall = [],
  cannotCall = [],
  route = ({ id }) => `/${defaultRouteName(Model)}/${encodeURIComponent(id)}`,
  queryParams = {},
  generateDummyObject = () => ({}),
} = {}) => [
  'It should only authorize deletion when authenticated user has enough rights',
  async () => {
    const expectDelete = async (roleGenerator) => {
      const [dummyObject, toDropLater = []] = [].concat(await generateDummyObject());
      const createdObject = await Model.create(dummyObject);

      const { statusCode } = await request()
        .delete(typeof route === 'function' ? route(createdObject) : route)
        .query(queryParams)
        .set(...roleGenerator());

      const object = await Model.findOne(createdObject.toObject());
      if (object) {
        await object.remove();
      }
      await Promise.all(toDropLater.map(entity => entity.remove()));

      return {
        statusCode: expect(statusCode),
        foundObject: expect(object),
      };
    };

    await Promise.all([
      ...canCall.map(async (roleGenerator) => {
        const { statusCode, foundObject } = await expectDelete(roleGenerator);
        statusCode.to.equal(204);
        foundObject.to.be.null;
      }),

      ...cannotCall.map(async (roleGenerator) => {
        const { statusCode } = await expectDelete(roleGenerator);
        statusCode.to.equal(403);
      }),
    ]);
  },
];
