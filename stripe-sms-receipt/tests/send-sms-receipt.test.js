const helpers = require('../../test/test-helper');
const sendSmsReceipt = require('../functions/send-sms-receipt').handler;

const mockStripeCharge = {
  id: 'ch_00000000000000',
  customer: {
    id: 'cus_00000000000000',
    phone: '+12025551212',
  },
  // eslint-disable-next-line camelcase
  receipt_url: 'https://receipt.url',
};

const mockChargeSuccededEvent = {
  id: 'evt_00000000000000',
  type: 'charge.succeeded',
  data: {
    object: mockStripeCharge,
  },
};

const mockStripeClient = {
  events: {
    retrieve: jest.fn(
      (id) =>
        new Promise((resolve, reject) => {
          if (id.startsWith('evt_')) {
            resolve(mockChargeSuccededEvent);
          } else {
            // eslint-disable-next-line prefer-promise-reject-errors
            reject({ message: 'No such event.' });
          }
        })
    ),
  },
  charges: {
    retrieve: jest.fn(() => Promise.resolve(mockStripeCharge)),
  },
};

jest.mock('stripe', () => {
  return jest.fn().mockImplementation(() => {
    return mockStripeClient;
  });
});

const mockTwilioClient = {
  messages: {
    create: jest.fn(() =>
      Promise.resolve({
        sid: 'my-new-sid',
      })
    ),
  },
};

const context = {
  STRIPE_SECRET_KEY: 'StripeSecretKey',
  getTwilioClient: () => mockTwilioClient,
};

beforeAll(() => {
  helpers.setup(context);
});

afterAll(() => {
  helpers.teardown();
});

test('return sid when SMS has been sent', (done) => {
  const callback = (_err, result) => {
    expect(mockStripeClient.events.retrieve).toHaveBeenCalledWith(
      mockChargeSuccededEvent.id
    );
    expect(mockStripeClient.charges.retrieve).toHaveBeenCalledWith(
      mockStripeCharge.id,
      {
        expand: ['customer'],
      }
    );
    expect(mockTwilioClient.messages.create).toHaveBeenCalledWith({
      to: mockStripeCharge.customer.phone,
      from: 'STRIPEDEMO',
      body: `Thanks for your payment ❤️ Here is your receipt: ${mockStripeCharge.receipt_url}`,
    });
    expect(result).toBeDefined();
    expect(result._statusCode).toEqual(200);
    done();
  };

  const event = {
    id: 'evt_00000000000000',
    type: 'charge.succeeded',
  };

  sendSmsReceipt(context, event, callback);
});

test('return 200 for any other events', (done) => {
  const callback = (_err, result) => {
    expect(result).toBeDefined();
    expect(result._statusCode).toEqual(200);
    done();
  };

  const event = {
    id: 'evt_00000000000000',
    type: 'some_event',
  };

  sendSmsReceipt(context, event, callback);
});

test('return 400 if we catch an error', (done) => {
  const callback = (_err, result) => {
    expect(result).toBeDefined();
    expect(result._statusCode).toEqual(400);
    done();
  };

  const event = {
    id: 'malformed',
    type: 'charge.succeeded',
  };

  sendSmsReceipt(context, event, callback);
});
