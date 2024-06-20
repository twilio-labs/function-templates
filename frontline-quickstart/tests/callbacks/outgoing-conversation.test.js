/* eslint-disable camelcase */
const helpers = require('../../../test/test-helper');
const outgoingConversation =
  require('../../functions/callbacks/outgoing-conversation.protected').handler;

const TEST_SSO_USERNAME = 'testworker';
const CUSTOMER_1_NUMBER = '+1222333444';
const CUSTOMER_2_NUMBER = '+1222333445';
const context = {
  TWILIO_PHONE_NUMBER: '+1234567890',
  SSO_USERNAME: TEST_SSO_USERNAME,
  EXAMPLE_CUSTOMER_1_PHONE_NUMBER: CUSTOMER_1_NUMBER,
  EXAMPLE_CUSTOMER_2_PHONE_NUMBER: CUSTOMER_2_NUMBER,
};

beforeAll(() => {
  helpers.setup(context);
});

afterAll(() => {
  helpers.teardown();
});

test('Outgoing conversation: resolves', async () => {
  const event = {
    Location: 'GetProxyAddress',
    ChannelType: 'sms',
  };

  const callback = (_err, result) => {
    console.log(result);
    expect(_err).toBeFalsy();
    expect(result).toBeDefined();
  };

  outgoingConversation(context, event, callback);
});

test('Outgoing conversation: fails on missing Location', async () => {
  const event = {
    ChannelType: 'sms',
  };

  const callback = (_err, result) => {
    console.log(result);
    expect(_err).toBeFalsy();
    expect(result).toBeDefined();
    expect(result._statusCode).toEqual(422);
  };

  outgoingConversation(context, event, callback);
});

test('Outgoing conversation: resolves for SMS channel', async () => {
  const event = {
    Location: 'GetProxyAddress',
    ChannelType: 'sms',
  };

  const callback = (_err, result) => {
    console.log(result);
    expect(_err).toBeFalsy();
    expect(result).toEqual({ proxy_address: context.TWILIO_PHONE_NUMBER });
  };

  outgoingConversation(context, event, callback);
});

test('Outgoing conversation: fails on unknown channelType', async () => {
  const event = {
    Location: 'GetProxyAddress',
    ChannelType: 'notexistentchanneltype',
  };

  const callback = (_err, result) => {
    console.log(result);
    expect(_err).toBeFalsy();
    expect(result).toBeDefined();
    expect(result._statusCode).toEqual(403);
  };

  outgoingConversation(context, event, callback);
});

test('Outgoing conversation: fails on missing channelType', async () => {
  const event = {
    Location: 'GetProxyAddress',
  };

  const callback = (_err, result) => {
    console.log(result);

    expect(_err).toBeFalsy();
    expect(result).toBeDefined();
    expect(result._statusCode).toEqual(403);
  };

  outgoingConversation(context, event, callback);
});
