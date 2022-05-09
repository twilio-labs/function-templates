/* eslint-disable camelcase */
const helpers = require('../../../test/test-helper');
const outgoingConversation =
  require('../../functions/callbacks/outgoing-conversation.protected').handler;

const TEST_WORKER_USERNAME = 'testworker';
const CUSTOMER_1_NUMBER = '+1222333444';
const CUSTOMER_2_NUMBER = '+1222333445';
const context = {
  TWILIO_PHONE_NUMBER: '+1234567890',
  WORKER_USERNAME: TEST_WORKER_USERNAME,
  PHONE_NUMBER_FOR_CUSTOMER_1: CUSTOMER_1_NUMBER,
  NAME_FOR_CUSTOMER_1: 'Test Customer 1',
  PHONE_NUMBER_FOR_CUSTOMER_2: CUSTOMER_2_NUMBER,
  NAME_FOR_CUSTOMER_2: 'Test Customer 2',
};

beforeAll(() => {
  helpers.setup(context);
});

afterAll(() => {
  helpers.teardown();
});

test('Outgoing conversation: resolves', async (done) => {
  const event = {
    Location: 'GetProxyAddress',
    ChannelType: 'sms',
  };

  const callback = (_err, result) => {
    console.log(result);
    expect(_err).toBeFalsy();
    expect(result).toBeDefined();
    done();
  };

  outgoingConversation(context, event, callback);
});

test('Outgoing conversation: fails on missing Location', async (done) => {
  const event = {
    ChannelType: 'sms',
  };

  const callback = (_err, result) => {
    console.log(result);
    expect(_err).toBeFalsy();
    expect(result).toBeDefined();
    expect(result._statusCode).toEqual(422);
    done();
  };

  outgoingConversation(context, event, callback);
});

test('Outgoing conversation: resolves for SMS channel', async (done) => {
  const event = {
    Location: 'GetProxyAddress',
    ChannelType: 'sms',
  };

  const callback = (_err, result) => {
    console.log(result);
    expect(_err).toBeFalsy();
    expect(result).toEqual({ proxy_address: context.TWILIO_PHONE_NUMBER });
    done();
  };

  outgoingConversation(context, event, callback);
});

test('Outgoing conversation: fails on unknown channelType', async (done) => {
  const event = {
    Location: 'GetProxyAddress',
    ChannelType: 'notexistentchanneltype',
  };

  const callback = (_err, result) => {
    console.log(result);
    expect(_err).toBeFalsy();
    expect(result).toBeDefined();
    expect(result._statusCode).toEqual(403);

    done();
  };

  outgoingConversation(context, event, callback);
});

test('Outgoing conversation: fails on missing channelType', async (done) => {
  const event = {
    Location: 'GetProxyAddress',
  };

  const callback = (_err, result) => {
    console.log(result);

    expect(_err).toBeFalsy();
    expect(result).toBeDefined();
    expect(result._statusCode).toEqual(403);
    done();
  };

  outgoingConversation(context, event, callback);
});
