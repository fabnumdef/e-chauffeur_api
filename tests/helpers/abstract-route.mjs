import chai from 'chai';
import request from '../request';

const { expect } = chai;

export const testCreateUnicity = (Model, {
  dummy,
  requestCallBack = r => r,
  transformObject = { id: '_id' },
  route = `/${(Model.getDashedName && Model.getDashedName()) || Model.modelName.toLowerCase()}`,
}) => [
  `Only one ${Model.modelName} should be able to be created with same parameters`,
  async () => {
    const rawDummyObject = dummy();
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
