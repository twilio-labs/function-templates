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

const mockEnvironment = {
  serviceSid: 'SERVICE_SID',
  sid: 'ENVIRONMENT_SID',
};
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

describe('voice-client-javascript/admin/private/shared', () => {
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
    //Arrange
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
    //Arrange
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

  test('getCurrentEnvironment is undefined for localhost', async () => {
    // Arrange
    const context = { ...CONTEXT };
    context.DOMAIN_NAME = 'localhost';

    // Act
    const environment = await shared.getCurrentEnvironment(context);

    // Assert
    expect(environment).not.toBeDefined();
  });

  test('getCurrentEnvironment returns undefined if no services are found', async () => {
    // Act
    const env = await shared.getCurrentEnvironment(CONTEXT);

    // Assert
    expect(env).not.toBeDefined();
  });

  test('getCurrentEnvironment returns undefined if no matching environments are found', async () => {
    // Arrange
    mockServicesList.mockReturnValue(
      Promise.resolve([
        {
          sid: 'SERVICE_SID',
        },
      ])
    );

    // Act
    const env = await shared.getCurrentEnvironment(CONTEXT);

    // Assert
    expect(env).not.toBeDefined();
    expect(CONTEXT.getTwilioClient).toHaveBeenCalled();
    expect(mockServicesList).toHaveBeenCalled();
    expect(mockTwilioClient.serverless.services).toHaveBeenCalledWith(
      'SERVICE_SID'
    );
    expect(mockEnvironmentList).toHaveBeenCalled();
  });

  test('getCurrentEnvironment returns matching environment', async () => {
    // Arrange
    mockServicesList.mockReturnValue(
      Promise.resolve([
        {
          sid: 'SERVICE_SID',
        },
      ])
    );

    mockEnvironmentList.mockReturnValue(
      Promise.resolve([
        {
          sid: 'MISS',
          domainName: 'spacejam.com',
        },
        {
          sid: 'HIT',
          domainName: CONTEXT.DOMAIN_NAME,
        },
      ])
    );

    // Act
    const env = await shared.getCurrentEnvironment(CONTEXT);

    // Assert
    expect(env).toBeDefined();
    expect(env.sid).toBe('HIT');
    expect(CONTEXT.getTwilioClient).toHaveBeenCalled();
    expect(mockServicesList).toHaveBeenCalled();
    expect(mockTwilioClient.serverless.services).toHaveBeenCalledWith(
      'SERVICE_SID'
    );
    expect(mockEnvironmentList).toHaveBeenCalled();
  });

  test('getEnvironmentVariables uses an environment to search', async () => {
    // Arrange
    const environment = {
      serviceSid: 'SERVICE_SID',
      sid: 'ENVIRONMENT_SID',
    };

    // Act
    const result = await shared.getEnvironmentVariables(CONTEXT, environment);

    // Assert
    expect(result).toBeDefined();
    expect(mockTwilioClient.serverless.services).toHaveBeenCalledWith(
      'SERVICE_SID'
    );
    expect(mockEnvironments).toHaveBeenCalledWith('ENVIRONMENT_SID');
  });

  test('getEnvironmentVariable finds existing variables', async () => {
    // Act
    const variable = await shared.getEnvironmentVariable(
      CONTEXT,
      mockEnvironment,
      'FIRST_NAME'
    );

    // Assert
    expect(variable).toBeDefined();
    expect(variable.value).toBe('Ada');
  });

  test('getEnvironmentVariable returns undefined when missing', async () => {
    // Arrange
    mockEnvironmentVariablesList.mockReturnValueOnce(Promise.resolve([]));

    // Act
    const variable = await shared.getEnvironmentVariable(
      CONTEXT,
      mockEnvironment,
      'FIRST_NAME'
    );

    // Assert
    expect(variable).not.toBeDefined();
  });

  test('setEnvironmentVariable will not override existing values if specified on update', async () => {
    const result = await shared.setEnvironmentVariable(
      CONTEXT,
      mockEnvironment,
      'FIRST_NAME',
      'Grace',
      false
    );

    expect(result).toBeFalsy();
    expect(mockVariables[1].update).not.toHaveBeenCalled();
  });

  test('setEnvironmentVariable will update existing values', async () => {
    const result = await shared.setEnvironmentVariable(
      CONTEXT,
      mockEnvironment,
      'FIRST_NAME',
      'Grace',
      true
    );

    expect(result).toBeTruthy();
    expect(mockVariables[1].update).toHaveBeenCalledWith({ value: 'Grace' });
  });

  test('setEnvironmentVariable will not update existing value if it is the same', async () => {
    const result = await shared.setEnvironmentVariable(
      CONTEXT,
      mockEnvironment,
      'FIRST_NAME',
      'Ada',
      true
    );

    expect(result).toBeFalsy();
    expect(mockVariables[1].update).not.toHaveBeenCalled();
  });

  test('setEnvironmentVariable will create a new variable', async () => {
    // Act
    const result = await shared.setEnvironmentVariable(
      CONTEXT,
      mockEnvironment,
      'MIDDLE_NAME',
      'Augusta',
      true
    );

    expect(result).toBeTruthy();
    expect(mockEnvironmentVariablesCreate).toHaveBeenCalledWith({
      key: 'MIDDLE_NAME',
      value: 'Augusta',
    });
  });

  /*
    getEnvironmentVariables,
    getEnvironmentVariable,
   setEnvironmentVariable,
 */
});
