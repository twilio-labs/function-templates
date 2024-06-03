const helpers = require('../../../test/test-helper');
const CRMCallback = require('../../functions/callbacks/crm.protected').handler;

const TEST_SSO_USERNAME = 'testworker';
const context = {
  TWILIO_PHONE_NUMBER: '+1234567890',
  SSO_USERNAME: TEST_SSO_USERNAME,
  EXAMPLE_CUSTOMER_1_PHONE_NUMBER: '+12223334444',
  EXAMPLE_CUSTOMER_2_PHONE_NUMBER: '+12223334444',
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

test('get customer details by customer ID', async () => {
  const event = {
    CustomerId: '1',
    Location: 'GetCustomerDetailsByCustomerId',
  };

  const callback = (_err, result) => {
    expect(result).toBeDefined();
    expect(result.objects.customer).toBeDefined();
  };

  CRMCallback(context, event, callback);
});

test('get customers list for worker', async () => {
  const event = {
    Worker: TEST_SSO_USERNAME,
    Location: 'GetCustomersList',
  };

  const callback = (_err, result) => {
    expect(result).toBeDefined();
    expect(result.objects.customers).toBeDefined();
    expect(result.objects.customers.length).toEqual(2);
  };

  CRMCallback(context, event, callback);
});
test('returns 422 for unknown location', async () => {
  const event = {};

  const callback = (_err, result) => {
    expect(result).toBeDefined();
    expect(result._statusCode).toEqual(422);
  };

  CRMCallback(context, event, callback);
});
