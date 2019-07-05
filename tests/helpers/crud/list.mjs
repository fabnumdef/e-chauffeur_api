import chai from 'chai';
import request from '../../request';
import { defaultRouteName } from './common';

const { expect } = chai;

/* eslint-disable-next-line import/prefer-default-export */
export const testList = (Model, {
  canCall = [],
  cannotCall = [],
  route = `/${defaultRouteName(Model)}`,
  queryParams = {},
} = {}) => [
  'It should response a list to the GET method',
  async () => {
    const expectList = async (roleGenerator) => {
      const { body, statusCode } = await request()
        .get(route)
        .query(queryParams)
        .set(...roleGenerator());

      return {
        statusCode: expect(statusCode),
        foundList: expect(body),
      };
    };

    await Promise.all([
      ...canCall.map(async (roleGenerator) => {
        const { statusCode, foundList } = await expectList(roleGenerator);
        statusCode.to.equal(200);
        foundList.to.be.an('array');
      }),

      ...cannotCall.map(async (roleGenerator) => {
        const { statusCode, foundList } = await expectList(roleGenerator);
        statusCode.to.equal(403);
        foundList.to.not.be.an('array');
      }),
    ]);
  },
];
