export default class HttpError extends Error {
  constructor(statusCode = 400, ...params) {
    super(...params);

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, HttpError);
    }

    this.status = statusCode;
    this.date = new Date();
  }
}
