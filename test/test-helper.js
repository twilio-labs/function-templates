const Twilio = require('twilio');

const setup = (context = {}) => {
  global.Twilio = Twilio;
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
