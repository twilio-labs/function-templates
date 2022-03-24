const helpers = require('../../test/test-helper');
const CRMCallback = require('../functions/callbacks/crm.protected').handler;

const TEST_WORKER_USERNAME = 'testworker';
const context = {
  TWILIO_PHONE_NUMBER: '+1234567890',
  WORKER_USERNAME: TEST_WORKER_USERNAME,
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
    '../assets/providers/customers.private.js'
  );
  helpers.setup({}, runtime);
});

afterAll(() => {
  helpers.teardown();
});

test('get customer details by customer ID', async (done) => {
  const event = {
    CustomerId: '1',
    Location: 'GetCustomerDetailsByCustomerId',
  };

  const callback = (_err, result) => {
    expect(result).toBeDefined();
    expect(result.objects.customer).toBeDefined();
    done();
  };

  CRMCallback(context, event, callback);
});

test('get customers list for worker', async (done) => {
  const event = {
    Worker: TEST_WORKER_USERNAME,
    Location: 'GetCustomersList',
  };

  const callback = (_err, result) => {
    expect(result).toBeDefined();
    expect(result.objects.customers).toBeDefined();
    expect(result.objects.customers.length).toEqual(2);
    done();
  };

  CRMCallback(context, event, callback);
});
test('returns 422 for unknown location', async (done) => {
  const event = {};

  const callback = (_err, result) => {
    expect(_err).toEqual(422);
    expect(result).toBeDefined();

    done();
  };

  CRMCallback(context, event, callback);
});
