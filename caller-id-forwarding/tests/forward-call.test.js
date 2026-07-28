/* eslint-disable camelcase */
const helpers = require('../../test/test-helper');
const forwardCall = require('../functions/forward-call.protected').handler;

const mockFetch = jest.fn().mockResolvedValue({
  lineTypeIntelligence: {
    carrier_name: 'Verizon',
    type: 'mobile',
  },
  callerName: {
    caller_name: 'Lottie Matthews',
  },
});

const mockClient = {
  lookups: {
    v2: {
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
    fields: 'caller_name,line_type_intelligence',
  };
  const callback = (_err, result) => {
    expect(result).toBeDefined();
    expect(mockClient.lookups.v2.phoneNumbers).toHaveBeenCalledWith(event.From);
    expect(mockFetch).toHaveBeenCalledWith(expectedParams);
    done();
  };

  forwardCall(context, event, callback);
});

test('sets the callername to Unknown if not returned', (done) => {
  const expectedParams = {
    body: `Incoming call from 54321
Name: Unknown
Carrier: Verizon (mobile)`,
    to: context.MY_PHONE_NUMBER,
    from: context.TWILIO_PHONE_NUMBER,
  };

  const callback = (_err, result) => {
    expect(result).toBeDefined();
    expect(mockClient.messages.create).toHaveBeenCalledWith(expectedParams);
    done();
  };

  mockFetch.mockResolvedValueOnce({
    lineTypeIntelligence: {
      carrier_name: 'Verizon',
      type: 'mobile',
    },
    callerName: {
      caller_name: null,
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
