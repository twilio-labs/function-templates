const helpers = require("../../test/test-helper");
const mailgun = require("mailgun-js");
const forwardMessageToMailgun = require("../functions/forward-message-mailgun").handler;
const Twilio = require("twilio");

const context = {
  MAILGUN_API_KEY: "MAILGUN_API_KEY",
  DOMAIN: "DOMAIN",
  TO_EMAIL_ADDRESS: "TO_EMAIL_ADDRESS",
  FROM_EMAIL_ADDRESS: "FROM_EMAIL_ADDRESS",
};

const event = {
  Body: "Hello",
  From: "ExternalNumber",
};

beforeAll(() => {
  helpers.setup(context);
});

afterAll(() => {
  helpers.teardown();
});

test("returns an TwiML MessagingResponse", async (done) => {
  const callback = (err, result) => {
    jest.mock("mailgun-js");
    expect(result).toBeInstanceOf(Twilio.twiml.MessagingResponse);
    done();
  };

  forwardMessageToMailgun(context, event, callback);
});
