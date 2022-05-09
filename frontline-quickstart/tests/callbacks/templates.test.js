const helpers = require('../../../test/test-helper');
const templatesCallback =
  require('../../functions/callbacks/templates.protected').handler;

const mockClient = {
  conversations: {},
};

const TEST_USERNAME = 'testworker';
const context = {
  getTwilioClient: () => mockClient,
  TWILIO_PHONE_NUMBER: '+1234567890',
  USERNAME: TEST_USERNAME,
  PHONE_NUMBER_FOR_CUSTOMER_1: '+12223334444',
  NAME_FOR_CUSTOMER_1: 'Test Customer 1',
  PHONE_NUMBER_FOR_CUSTOMER_2: '+12223334444',
  NAME_FOR_CUSTOMER_2: 'Test Customer 2',
};

beforeAll(() => {
  helpers.setup(context);
  const runtime = new helpers.MockRuntime();
  runtime._addAsset(
    '/providers/customers.js',
    '../../assets/providers/customers.private.js'
  );
  helpers.setup({}, runtime);
});

afterAll(() => {
  helpers.teardown();
});

test('GetTemplatesByCustomerId: returns templates', async (done) => {
  const event = {
    CustomerId: 1,
    Location: 'GetTemplatesByCustomerId',
  };

  const callback = (_err, result) => {
    expect(_err).toBeFalsy();
    expect(result).toBeDefined();
    expect(result.length).toBeTruthy();
    done();
  };

  templatesCallback(context, event, callback);
});

test('GetTemplatesByCustomerId: fails on unknown location', async (done) => {
  const event = {
    CustomerId: 1,
  };

  const callback = (_err, result) => {
    expect(_err).toBeFalsy();
    expect(result).toBeDefined();
    expect(result._statusCode).toEqual(422);
    done();
  };

  templatesCallback(context, event, callback);
});
