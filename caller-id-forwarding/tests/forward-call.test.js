const helpers = require('../../test/test-helper');
const forwardCall = require('../functions/forward-call.protected').handler;

const mockFetch = jest.fn().mockResolvedValue({
  carrier: {
    name: 'Verizon',
    type: 'mobile',
  },
  callerName: {
    // eslint-disable-next-line camelcase
    caller_name: 'Lottie Matthews',
  },
});

const mockClient = {
  lookups: {
    v1: {
      phoneNumbers: jest.fn(() => ({
        fetch: mockFetch,
      })),
    },
  },
  messages: {
    create: jest.fn(() => Promise.resolve({})),
  },
};

const context = {
  MY_PHONE_NUMBER: 'My Number',
  TWILIO_PHONE_NUMBER: 'Twilio Number',
  getTwilioClient: () => mockClient,
};

const event = {
  From: '54321',
};

beforeAll(() => {
  helpers.setup(context);
});

afterAll(() => {
  helpers.teardown();
});

test('forwards the call to the number from the context', (done) => {
  const callback = (_err, result) => {
    expect(result.toString()).toMatch(
      `<Dial>${context.MY_PHONE_NUMBER}</Dial>`
    );
    done();
  };

  forwardCall(context, event, callback);
});

test('looks up the incoming phone number', (done) => {
  const expectedParams = {
    type: ['carrier', 'caller-name'],
  };
  const callback = (_err, result) => {
    expect(result).toBeDefined();
    expect(mockClient.lookups.v1.phoneNumbers).toHaveBeenCalledWith(event.From);
    expect(mockFetch).toHaveBeenCalledWith(expectedParams);
    done();
  };

  forwardCall(context, event, callback);
});

test('sets the callername to Unknown if not returned', (done) => {
  const callback = (_err, result) => {
    expect(result).toBeDefined();
    const expectedParams = {
      body: `Incoming call from 54321
Name: Unknown
Carrier: Verizon (mobile)`,
      to: context.MY_PHONE_NUMBER,
      from: context.TWILIO_PHONE_NUMBER,
    };
    expect(mockClient.messages.create).toHaveBeenCalledWith(expectedParams);
    done();
  };

  mockFetch.mockResolvedValueOnce({
    callerName: {
      // eslint-disable-next-line camelcase
      caller_name: null,
    },
    carrier: {
      name: 'Verizon',
      type: 'mobile',
    },
  });

  forwardCall(context, event, callback);
});

test('sends a message to the forwarding number', (done) => {
  const callback = (_err, result) => {
    expect(result).toBeDefined();
    const expectedParams = {
      body: `Incoming call from 54321
Name: Lottie Matthews
Carrier: Verizon (mobile)`,
      to: context.MY_PHONE_NUMBER,
      from: context.TWILIO_PHONE_NUMBER,
    };
    expect(mockClient.messages.create).toHaveBeenCalledWith(expectedParams);
    done();
  };

  forwardCall(context, event, callback);
});
