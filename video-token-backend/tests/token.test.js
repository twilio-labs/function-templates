const helpers = require('../../test/test-helper');
const tokenFunction = require('../functions/token').handler;

const context = {};

beforeAll(() => {
  helpers.setup(context);
});

afterAll(() => {
  helpers.teardown();
});

describe('the /token endpoint', () => {
  it('should return a 401 when the passcode is not correct', () => {
    const mockCallback = jest.fn();
    tokenFunction({ PASSCODE: 'ok' }, { passcode: 'no' }, mockCallback);
    expect(mockCallback).toHaveBeenCalledWith(null, {
      _body: 'Invalid passcode',
      _headers: {},
      _statusCode: 401,
    });
  });

  it('should return a 401 when the passcode has not been generated', () => {
    const mockCallback = jest.fn();
    tokenFunction({}, {}, mockCallback);
    expect(mockCallback).toHaveBeenCalledWith(null, {
      _body: 'Passcode has not yet been generated',
      _headers: {},
      _statusCode: 401,
    });
  });

  it('should return a 400 when the room_name parameter is missing', () => {
    const mockCallback = jest.fn();
    tokenFunction(
      { PASSCODE: 'ok' },
      { passcode: 'ok', identity: 'tim' },
      mockCallback
    );
    expect(mockCallback).toHaveBeenCalledWith(null, {
      _body: 'Missing "room_name" parameter',
      _headers: {},
      _statusCode: 400,
    });
  });

  it('should return a 400 when the identity parameter is missing', () => {
    const mockCallback = jest.fn();
    tokenFunction(
      { PASSCODE: 'ok' },
      // eslint-disable-next-line camelcase
      { passcode: 'ok', room_name: 'room' },
      mockCallback
    );
    expect(mockCallback).toHaveBeenCalledWith(null, {
      _body: 'Missing "identity" parameter',
      _headers: {},
      _statusCode: 400,
    });
  });

  it('should return a JWT token with a valid room grant', () => {
    const mockCallback = jest.fn();
    tokenFunction(
      {
        PASSCODE: 'ok',
        ACCOUNT_SID: 'test-account-sid',
        API_KEY_SID: 'test-api-key-sid',
        API_KEY_SECRET: 'test-api-key-secret',
      },
      // eslint-disable-next-line camelcase
      { passcode: 'ok', room_name: 'room', identity: 'tim' },
      mockCallback
    );

    expect(mockCallback).toHaveBeenCalledWith(null, {
      token: expect.any(String),
    });

    const { token } = mockCallback.mock.calls[0][1];
    const payload = Buffer.from(token.split('.')[1], 'base64').toString();

    expect(JSON.parse(payload)).toMatchObject({
      grants: {
        identity: 'tim',
        video: { room: 'room' },
      },
      iss: 'test-api-key-sid',
      sub: 'test-account-sid',
    });
  });
});
