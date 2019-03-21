import Validator from 'node-input-validator';

export default ({
  async check(formFields, rulesFields) {
    const validator = new Validator(formFields, rulesFields);
    const valid = await validator.check();

    return { matched: valid, errors: validator.errors };
  },
});
