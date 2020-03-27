const helpers = require('../../test/test-helper');
const broadcastSms = require('../functions/save-sms').handler;
const Twilio = require('twilio');

const context = {
  AIRTABLE_APIKEY: 'keyAbcD12efG3HijK',
  AIRTABLE_BASEID: 'appAbcD12efG3HijK',
  AIRTABLE_TABLENAME: 'Table 1',
  MY_PHONE_NUMBER: 'TwilioNumber'
};
const event = {};

beforeAll(() => {
  helpers.setup(context);
});

afterAll(() => {
  helpers.teardown();
});

test('returns a Response', done => {
  const callback = (err, result) => {
    expect(result).toBeInstanceOf(Twilio.Response);
    done();
  };

  broadcastSms(context, event, callback);
});
