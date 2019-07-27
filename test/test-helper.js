const Twilio = require('twilio');

class Response {
  constructor() {
    this._body = {};
    this._headers = {};
  }

  setBody(body) {
    this._body = body;
  }

  appendHeader(key, value) {
    this._headers[key] = value;
  }
}

const setup = (context = {}) => {
  global.Twilio = Twilio;
  global.Twilio.Response = Response;
  if (context.ACCOUNT_SID && context.AUTH_TOKEN) {
    global.twilioClient = new Twilio(context.ACCOUNT_SID, context.AUTH_TOKEN);
  }
};

const teardown = () => {
  delete global.Twilio;
  if (global.twilioClient) delete global.twilioClient;
};

module.exports = {
  setup: setup,
  teardown: teardown
};
