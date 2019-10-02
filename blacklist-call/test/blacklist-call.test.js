const helpers = require('../../test/test-helper');
const forwardCall = require('../functions/blacklist-call').handler;
const Twilio = require('twilio');

const context = {
  MY_PHONE_NUMBER: 'TwilioNumber'
};
const event = {};

beforeAll(() => {
  helpers.setup(context);
});

afterAll(() => {
  helpers.teardown();
});

test('blacklists the event.blacklist', done => {

});

test('redirects to webhook', done => {

});
