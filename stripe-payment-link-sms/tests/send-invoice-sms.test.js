const helpers = require('../../test/test-helper');
const sendPaymentLink = require('../functions/send-invoice-sms').handler;

const mockStripeInvoice = {
  id: 'in_00000000000000',
  customer_phone: '+12025551212',
  hosted_invoice_url: 'https://receipt.url',
};

const mockInvoiceFinalizedEvent = {
  id: 'evt_00000000000000',
  type: 'invoice.finalized',
  data: {
    object: mockStripeInvoice,
  },
};

const mockStripeClient = {
  events: {
    retrieve: jest.fn(
      (id) =>
        new Promise((resolve, reject) => {
          if (id.startsWith('evt_')) {
            resolve(mockInvoiceFinalizedEvent);
          } else {
            reject({ message: 'No such event.' });
          }
        })
    ),
  },
  invoices: {
    retrieve: jest.fn(() => Promise.resolve(mockStripeInvoice)),
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
  const callback = (err, result) => {
    expect(mockStripeClient.events.retrieve).toHaveBeenCalledWith(
      mockInvoiceFinalizedEvent.id
    );
    expect(mockStripeClient.invoices.retrieve).toHaveBeenCalledWith(
      mockStripeInvoice.id
    );
    expect(mockTwilioClient.messages.create).toHaveBeenCalledWith({
      to: mockStripeInvoice.customer_phone,
      from: 'STRIPEDEMO',
      body: `Thanks for your donation ❤️ Here is your payment link: ${mockStripeInvoice.hosted_invoice_url}`,
    });
    expect(result).toBeDefined();
    expect(result._statusCode).toEqual(200);
    done();
  };

  const event = {
    id: 'evt_00000000000000',
    type: 'invoice.finalized',
  };

  sendPaymentLink(context, event, callback);
});

test('return 200 for any other events', (done) => {
  const callback = (err, result) => {
    expect(result).toBeDefined();
    expect(result._statusCode).toEqual(200);
    done();
  };

  const event = {
    id: 'evt_00000000000000',
    type: 'some_event',
  };

  sendPaymentLink(context, event, callback);
});

test('return 400 if we catch an error', (done) => {
  const callback = (err, result) => {
    expect(result).toBeDefined();
    expect(result._statusCode).toEqual(400);
    done();
  };

  const event = {
    id: 'malformed',
    type: 'invoice.finalized',
  };

  sendPaymentLink(context, event, callback);
});
