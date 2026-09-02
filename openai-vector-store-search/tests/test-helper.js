/*
 * Minimal stand-in for the Twilio Runtime globals this template's Functions
 * rely on (`new Twilio.Response()`), kept local to this directory so the
 * template's tests don't depend on anything outside it.
 */
class Response {
  constructor() {
    this._body = {};
    this._headers = {};
    this._statusCode = 200;
  }

  setBody(body) {
    this._body = body;
  }

  setStatusCode(code) {
    this._statusCode = code;
  }

  appendHeader(key, value) {
    this._headers[key] = value;
  }
}

const setup = () => {
  global.Twilio = { Response };
};

const teardown = () => {
  delete global.Twilio;
};

module.exports = {
  setup,
  teardown,
  Response,
};
