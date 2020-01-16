import chai from 'chai';
import csv2Json from 'csvtojson';
import request from '../../request';
import { defaultRouteName } from './common';
import generateBatch from '../batch/generateBatch';

const { expect } = chai;

// eslint-disable-next-line import/prefer-default-export
export const testBatch = (Model, {
  canCall = [],
  cannotCall = [],
  queryParams = {},
  route = `/${defaultRouteName(Model)}/batch`,
  ref = '_id',
} = {}) => [
  'It should only authorize creation when authenticated user has enough rights',
  async () => {
    const expectBatch = async (roleGenerator) => {
      const [name, path] = await generateBatch(defaultRouteName(Model));
      const { statusCode } = await request()
        .post(route)
        .set(...roleGenerator())
        .query({ ...queryParams })
        .attach(name, path);

      const batch = await csv2Json({ delimiter: ';', ignoreEmpty: true }).fromFile(path);
      await Promise.all(batch.map((item) => Model.findOneAndDelete({ [ref]: item[ref] })));

      return {
        statusCode: expect(statusCode),
      };
    };

    await Promise.all(canCall.map(async (roleGenerator) => {
      const { statusCode } = await expectBatch(roleGenerator);
      statusCode.to.equal(204);
    }));

    await Promise.all(cannotCall.map(async (roleGenerator) => {
      const { statusCode } = await expectBatch(roleGenerator);
      statusCode.to.equal(403);
    }));
  },
];
