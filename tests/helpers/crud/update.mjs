import chai from 'chai';
import request from '../../request';
import { cleanObject } from '../../../middlewares/mask-output';
import { defaultRouteName } from './common';

const { expect } = chai;

/* eslint-disable-next-line import/prefer-default-export */
export const testUpdate = (Model, {
  canCall = [],
  cannotCall = [],
  route = ({ id }) => `/${defaultRouteName(Model)}/${encodeURIComponent(id)}`,
  queryParams = {},
  generateDummyObject = () => ({}),
} = {}) => [
  'It should only authorize update when authenticated user has enough rights',
  async () => {
    const expectUpdate = async (roleGenerator) => {
      const [dummyObject, toDropLater = []] = [].concat(await generateDummyObject());
      const createdObject = await Model.create(dummyObject);

      const { statusCode } = await request()
        .patch(typeof route === 'function' ? route(createdObject) : route)
        .query(queryParams)
        .set(...roleGenerator())
        .send(cleanObject(dummyObject));

      const object = await Model.findById(createdObject._id);
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
        const { statusCode, foundObject } = await expectUpdate(roleGenerator);
        statusCode.to.equal(200);
        foundObject.to.not.be.null;
      }),

      ...cannotCall.map(async (roleGenerator) => {
        const { statusCode } = await expectUpdate(roleGenerator);
        statusCode.to.equal(403);
      }),
    ]);
  },
];
