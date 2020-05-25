export default class APIError extends Error {
  constructor(status = 500, message = null) {
    super(message);

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, APIError);
    }

    this.status = status;
    this.errors = [];
  }

  addError(message, params) {
    this.errors.push({ message, ...params });
    return this;
  }

  addErrors(errors) {
    errors.forEach((error) => this.addError(...error));
    return this;
  }
}
