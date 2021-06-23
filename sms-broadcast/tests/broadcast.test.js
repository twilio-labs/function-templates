const helpers = require('../../test/test-helper');
const broadcast = require('../functions/broadcast.protected').handler;
const Twilio = require('twilio');

let mockService;
const mockClient = {
  notify: {
    services: jest.fn(() => mockService),
  },
};

const context = {
  BROADCAST_NOTIFY_SERVICE_SID: 'ISXXXXXXX',
  BROADCAST_ADMIN_NUMBERS: '+12345',
  getTwilioClient: jest.fn(() => mockClient),
};

afterAll(() => {
  helpers.teardown();
});

describe('help', () => {
  test('returns help text without a recognised command', (done) => {
    helpers.setup(context);
    const callback = (_err, result) => {
      expect(result).toBeInstanceOf(Twilio.twiml.MessagingResponse);
      expect(result.toString()).toMatch(
        '<Message>Hello! Text "subscribe" to receive updates, "stop" to stop getting messages, and "start" to receive them again.</Message>'
      );
      done();
    };

    const event = {
      Body: 'nothing',
      From: '+1555123456',
    };

    broadcast(context, event, callback);
  });

  test('returns help text without a command at all', (done) => {
    helpers.setup(context);
    const callback = (_err, result) => {
      expect(result).toBeInstanceOf(Twilio.twiml.MessagingResponse);
      expect(result.toString()).toMatch(
        '<Message>Hello! Text "subscribe" to receive updates, "stop" to stop getting messages, and "start" to receive them again.</Message>'
      );
      done();
    };

    const event = {
      Body: '',
      From: '+1555123456',
    };

    broadcast(context, event, callback);
  });
});

describe('subscribing', () => {
  test('successfully subscribes a phone number by creating a binding', (done) => {
    helpers.setup(context);

    mockService = {
      bindings: {
        create: jest.fn(() => Promise.resolve()),
      },
    };

    const event = {
      Body: 'subscribe',
      From: '+1555123456',
    };

    const callback = (_err, result) => {
      expect(mockService.bindings.create).toHaveBeenCalledTimes(1);
      expect(mockService.bindings.create).toHaveBeenCalledWith({
        identity: event.From,
        bindingType: 'sms',
        address: event.From,
      });
      expect(result).toBeInstanceOf(Twilio.twiml.MessagingResponse);
      expect(result.toString()).toMatch(
        '<Message>Thanks! You have been subscribed for updates.</Message>'
      );
      done();
    };

    broadcast(context, event, callback);
  });

  test('returns an error message if creating the binding fails', (done) => {
    helpers.setup(context);

    const error = 'Failed';

    mockService = {
      bindings: {
        create: jest.fn(() => Promise.reject(error)),
      },
    };

    console.error = jest.fn();

    const event = {
      Body: 'subscribe',
      From: '+1555123456',
    };

    const callback = (_err, result) => {
      expect(console.error).toHaveBeenCalledTimes(1);
      expect(console.error).toHaveBeenCalledWith(error);
      expect(mockService.bindings.create).toHaveBeenCalledTimes(1);
      expect(mockService.bindings.create).toHaveBeenCalledWith({
        identity: event.From,
        bindingType: 'sms',
        address: event.From,
      });
      expect(result).toBeInstanceOf(Twilio.twiml.MessagingResponse);
      expect(result.toString()).toMatch(
        "<Message>Dang it. We couldn't subscribe you - try again later?</Message>"
      );
      done();
    };

    broadcast(context, event, callback);
  });
});

describe('broadcasting', () => {
  test('returns message if from number is not an admin', (done) => {
    helpers.setup(context);

    const callback = (_err, result) => {
      expect(result).toBeInstanceOf(Twilio.twiml.MessagingResponse);
      expect(result.toString()).toMatch(
        '<Message>Your phone number is not authorized to broadcast in this application</Message>'
      );
      done();
    };

    const event = {
      Body: 'broadcast this is a great message',
      From: '+1555123456',
    };

    broadcast(context, event, callback);
  });

  test('creates a notification and returns a success message when an admin sends a broadcast', (done) => {
    helpers.setup(context);

    mockService = {
      notifications: {
        create: jest.fn(() => Promise.resolve()),
      },
    };

    const callback = (_err, result) => {
      expect(mockService.notifications.create).toHaveBeenCalledTimes(1);
      expect(mockService.notifications.create).toHaveBeenCalledWith({
        tag: 'all',
        body: 'this is a great message',
      });
      expect(result).toBeInstanceOf(Twilio.twiml.MessagingResponse);
      expect(result.toString()).toMatch(
        '<Message>Boom! Message broadcast to all subscribers.</Message>'
      );
      done();
    };

    const event = {
      Body: 'broadcast this is a great message',
      From: '+12345',
    };

    broadcast(context, event, callback);
  });

  test('returns an error message if the notification fails', (done) => {
    helpers.setup(context);

    const error = 'Failed';

    mockService = {
      notifications: {
        create: jest.fn(() => Promise.reject(error)),
      },
    };

    console.error = jest.fn();

    const callback = (_err, result) => {
      expect(mockService.notifications.create).toHaveBeenCalledTimes(1);
      expect(mockService.notifications.create).toHaveBeenCalledWith({
        tag: 'all',
        body: 'this is a great message',
      });
      expect(console.error).toHaveBeenCalledTimes(1);
      expect(console.error).toHaveBeenCalledWith(error);
      expect(result).toBeInstanceOf(Twilio.twiml.MessagingResponse);
      expect(result.toString()).toMatch(
        '<Message>Well this is awkward. Your message failed to send, try again later.</Message>'
      );
      done();
    };

    const event = {
      Body: 'broadcast this is a great message',
      From: '+12345',
    };

    broadcast(context, event, callback);
  });
});
