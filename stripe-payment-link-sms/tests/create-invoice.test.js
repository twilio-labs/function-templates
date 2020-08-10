const helpers = require('../../test/test-helper');
const createInvoice = require('../functions/create-invoice').handler;

const context = {
  STRIPE_SECRET_KEY: 'StripeSecretKey',
  TWILIO_PHONE_NUMBER: 'TwilioNumber',
};

const mockStripeCustomer = {
  id: 'cus_00000000000000',
  description: 'SMS customer via Twilio',
  phone: 'ExternalNumber',
};

const mockStripeInvoice = {
  id: 'in_00000000000000',
  customer_phone: '+12025551212',
  hosted_invoice_url: 'https://receipt.url',
};

const mockStripeClient = {
  customers: {
    create: jest.fn(() => Promise.resolve(mockStripeCustomer)),
  },
  invoiceItems: {
    create: jest.fn(
      ({ amount }) =>
        new Promise((resolve, reject) => {
          if (isNaN(amount)) {
            reject({ message: 'Invalid integer: NaN' });
          } else {
            resolve();
          }
        })
    ),
  },
  invoices: {
    create: jest.fn(() => Promise.resolve(mockStripeInvoice)),
    finalizeInvoice: jest.fn(() => Promise.resolve(mockStripeInvoice)),
  },
};

jest.mock('stripe', () => {
  return jest.fn().mockImplementation(() => {
    return mockStripeClient;
  });
});

beforeAll(() => {
  helpers.setup(context);
});

afterAll(() => {
  helpers.teardown();
});

test('create invoice when prompt correct', (done) => {
  const callback = () => {
    expect(mockStripeClient.customers.create).toHaveBeenCalledWith({
      description: 'SMS customer via Twilio',
      phone: 'ExternalNumber',
    });
    expect(mockStripeClient.invoiceItems.create).toHaveBeenCalledWith({
      customer: mockStripeCustomer.id,
      amount: 1000,
      currency: 'USD',
      description: `DONATE 10 USD`,
    });
    expect(mockStripeClient.invoices.create).toHaveBeenCalledWith({
      customer: mockStripeCustomer.id,
      auto_advance: false,
    });
    expect(mockStripeClient.invoices.finalizeInvoice).toHaveBeenCalledWith(
      mockStripeInvoice.id
    );
    done();
  };

  const event = {
    Body: 'Donate 10',
    From: 'ExternalNumber',
  };

  createInvoice(context, event, callback);
});

test('return 200 OK for incorrect prompts', (done) => {
  const callback = (err, result) => {
    expect(err).toBeUndefined();
    expect(result).toBeUndefined();
    done();
  };

  const event = {
    Body: 'Wrong command',
    From: 'ExternalNumber',
  };

  createInvoice(context, event, callback);
});

test('return error if incorrect amount', (done) => {
  const callback = (err, result) => {
    expect(err).toBeDefined();
    expect(result).toBeUndefined();
    done();
  };

  const event = {
    Body: 'Donate malformed',
    From: 'ExternalNumber',
  };

  createInvoice(context, event, callback);
});
