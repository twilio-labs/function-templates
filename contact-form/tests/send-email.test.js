const sendMock = jest.fn();
const setApiKeyMock = jest.fn();

const sg = jest.mock('@sendgrid/mail', () => {
  return {
    setApiKey: setApiKeyMock,
    send: sendMock,
  };
});

const helpers = require('../../test/test-helper');
const sendEmail = require('../functions/send-email').handler;

const context = {
  TO_EMAIL_ADDRESS: 'to@example.com',
  FROM_EMAIL_ADDRESS: 'from@example.com',
  SENDGRID_API_KEY: 'SG.abcdef123456',
};

beforeEach(() => jest.resetAllMocks());

beforeAll(() => {
  helpers.setup(context);
});

afterAll(() => {
  helpers.teardown();
});

describe('send email', () => {
  it('returns 200 response when it successfully sends an email', (done) => {
    const event = {
      from: 'from2@example.com',
      content: 'Hello',
      subject: 'This is a subject',
    };

    const callback = (_err, result) => {
      expect(result).toBeInstanceOf(Twilio.Response);
      expect(result._statusCode).toEqual(200);
      expect(result._body.success).toBe(true);
      expect(setApiKeyMock).toHaveBeenCalled();
      expect(sendMock).toHaveBeenCalledWith({
        to: context.TO_EMAIL_ADDRESS,
        from: { email: context.FROM_EMAIL_ADDRESS, name: 'Your contact form' },
        replyTo: event.from,
        subject: `[contactform] ${event.subject}`,
        text: `New email from ${event.from}.\n\n${event.content}`,
      });
      done();
    };

    sendMock.mockResolvedValue(() => ({}));

    sendEmail(context, event, callback);
  });

  it('returns 200 response when it successfully sends an email without a subject', (done) => {
    const event = {
      from: 'from2@example.com',
      content: 'Hello',
    };

    const callback = (_err, result) => {
      expect(result).toBeInstanceOf(Twilio.Response);
      expect(result._statusCode).toEqual(200);
      expect(result._body.success).toBe(true);
      expect(setApiKeyMock).toHaveBeenCalled();
      expect(sendMock).toHaveBeenCalledWith({
        to: context.TO_EMAIL_ADDRESS,
        from: { email: context.FROM_EMAIL_ADDRESS, name: 'Your contact form' },
        replyTo: event.from,
        subject: `[contactform]`,
        text: `New email from ${event.from}.\n\n${event.content}`,
      });
      done();
    };

    sendMock.mockResolvedValue(() => ({}));

    sendEmail(context, event, callback);
  });

  it('returns a 400 response when from is blank', (done) => {
    const callback = (_err, result) => {
      expect(result).toBeInstanceOf(Twilio.Response);
      expect(result._statusCode).toEqual(400);
      expect(result._body.success).toBe(false);
      expect(result._body.error).toEqual("Please set a 'from' email.");
      expect(sendMock).not.toHaveBeenCalled();
      expect(setApiKeyMock).not.toHaveBeenCalled();
      done();
    };

    const event = {
      from: '',
      content: 'Hello',
    };
    sendEmail(context, event, callback);
  });

  it('returns a 400 response when content is blank', (done) => {
    const callback = (_err, result) => {
      expect(result).toBeInstanceOf(Twilio.Response);
      expect(result._statusCode).toEqual(400);
      expect(result._body.success).toBe(false);
      expect(result._body.error).toEqual(
        'Please enter some content for the email.'
      );
      expect(sendMock).not.toHaveBeenCalled();
      expect(setApiKeyMock).not.toHaveBeenCalled();
      done();
    };

    const event = {
      from: 'from2@example.com',
      content: '',
    };
    sendEmail(context, event, callback);
  });

  it('returns a 400 response when it fails to send an email', (done) => {
    const callback = (_err, result) => {
      expect(result).toBeInstanceOf(Twilio.Response);
      expect(result._statusCode).toEqual(400);
      expect(result._body.success).toBe(false);
      expect(result._body.error).toEqual('Could not send email');
      expect(setApiKeyMock).toHaveBeenCalled();
      done();
    };

    sendMock.mockRejectedValue({
      message: 'Could not send email',
    });

    const event = {
      from: 'from2@example.com',
      content: 'Hello',
    };
    sendEmail(context, event, callback);
  });

  it('returns a 400 response when it fails to send an email and returns the API error', (done) => {
    const callback = (_err, result) => {
      expect(result).toBeInstanceOf(Twilio.Response);
      expect(result._statusCode).toEqual(400);
      expect(result._body.success).toBe(false);
      expect(result._body.error).toEqual('Something went wrong');
      expect(setApiKeyMock).toHaveBeenCalled();
      done();
    };

    sendMock.mockRejectedValue({
      message: 'Could not send email',
      response: {
        body: {
          errors: ['Something went wrong'],
        },
      },
    });

    const event = {
      from: 'from2@example.com',
      content: 'Hello',
    };
    sendEmail(context, event, callback);
  });
});
