const helpers = require('../../../../test/test-helper');
const shared = require('../../../assets/admin/shared.private');

const mockTwilioClient = {
  serverless: {},
};

const mockVariables = [
  {
    key: 'LAST_NAME',
    value: 'Lovelace',
    update: jest.fn(),
  },
  {
    key: 'FIRST_NAME',
    value: 'Ada',
    update: jest.fn(),
  },
];

const mockServicesList = jest.fn(() => Promise.resolve([]));
const mockEnvironmentList = jest.fn(() => Promise.resolve([]));
const mockEnvironmentVariablesList = jest.fn(() =>
  Promise.resolve(mockVariables)
);
const mockEnvironmentVariablesCreate = jest.fn(() => Promise.resolve([]));

const mockEnvironments = jest.fn(() => {
  return {
    variables: {
      list: mockEnvironmentVariablesList,
      create: mockEnvironmentVariablesCreate,
    },
  };
});

mockTwilioClient.serverless.services = jest.fn(() => {
  const inner = {
    environments: mockEnvironments,
  };
  inner.environments.list = mockEnvironmentList;
  return inner;
});

mockTwilioClient.serverless.services.list = mockServicesList;

const CONTEXT = {
  ACCOUNT_SID: 'AC123',
  AUTH_TOKEN: '0a123',
  DOMAIN_NAME: 'testing-domain-123.com',
  getTwilioClient: jest.fn(() => mockTwilioClient),
};

let origAdminPassword;

describe('voice-javascript-sdk/admin/private/shared', () => {
  beforeAll(() => {
    helpers.setup(CONTEXT);
    if (process.env.ADMIN_PASSWORD) {
      origAdminPassword = process.env.ADMIN_PASSWORD;
    }
    process.env.ADMIN_PASSWORD = 'testing';
  });
  afterAll(() => {
    if (origAdminPassword) {
      process.env.ADMIN_PASSWORD = origAdminPassword;
    } else {
      delete process.env.ADMIN_PASSWORD;
    }
  });
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('urlForSiblingPage replaces page in relative urls', () => {
    // Act
    const url = shared.urlForSiblingPage('third', '/first/second/page');

    // Assert
    expect(url).toBe('/first/second/third');
  });

  test('urlForSiblingPage replaces page in with multiple paths', () => {
    // Act
    const url = shared.urlForSiblingPage('third', '/first/second/page', '..');

    // Assert
    expect(url).toBe('/first/third');
  });

  test('checkAuthorization passes thru on success', () => {
    // Arrange
    const event = {
      token: shared.createToken(CONTEXT, process.env.ADMIN_PASSWORD),
    };
    const cb = jest.fn();

    // Act
    const result = shared.checkAuthorization(CONTEXT, event, cb);

    // Assert
    expect(result).toBeTruthy();
    expect(cb).not.toHaveBeenCalled();
  });

  test('checkAuthorization returns a Twilio Response on failure', () => {
    // Arrange
    const event = {
      token: "this isn't right",
    };
    const cb = jest.fn();

    // Act
    const result = shared.checkAuthorization(CONTEXT, event, cb);

    // Assert
    expect(result).toBeFalsy();
    expect(cb).toHaveBeenCalledWith(null, {
      _body: 'Not authorized',
      _headers: {},
      _statusCode: 403,
    });
  });
});
