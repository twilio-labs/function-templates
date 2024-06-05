const helpers = require('../../../../test/test-helper');

/* eslint-disable sonarjs/no-identical-functions, sonarjs/no-duplicate-string*/

const statusFunctions = {};
let environmentFunction;
let mockGetCurrentEnvironment;

const mockApplications = {
  fetch: jest.fn(),
};

const mockKeys = {
  fetch: jest.fn(),
};

// eslint-disable-next-line sonarjs/prefer-object-literal
const mockTwilioClient = {};
mockTwilioClient.applications = jest.fn(() => mockApplications);
mockTwilioClient.applications.list = jest.fn(() => Promise.resolve([]));
mockTwilioClient.keys = jest.fn(() => mockKeys);
mockTwilioClient.incomingPhoneNumbers = {
  list: jest.fn(() => [
    {
      phoneNumber: '+15551234567',
      friendlyName: '(555) 123-4567',
    },
    {
      phoneNumber: '+15557654321',
      friendlyName: 'My Business line',
    },
  ]),
};
mockTwilioClient.outgoingCallerIds = {
  list: jest.fn(() => [
    {
      phoneNumber: '+18001234567',
      friendlyName: 'My Toll Free',
    },
  ]),
};

const CONTEXT = {
  ACCOUNT_SID: 'AC123',
  AUTH_TOKEN: '0a123',
  DOMAIN_NAME: 'testing-domain-123.com',
  PATH: '/check-status',
  getTwilioClient: jest.fn(() => mockTwilioClient),
};

let backupEnv;

describe('voice-javascript-sdk/admin/private/statuses', () => {
  beforeAll(() => {
    const runtime = new helpers.MockRuntime();
    runtime._addAsset(
      '/admin/shared.js',
      '../../../assets/admin/shared.private.js'
    );
    helpers.setup(CONTEXT, runtime);
    // Mock out shared
    mockGetCurrentEnvironment = jest.fn();
    const mockShared = jest.mock('../../../assets/admin/shared.private', () => {
      const actualShared = jest.requireActual(
        '../../../assets/admin/shared.private'
      );
      return {
        urlForSiblingPage: actualShared.urlForSiblingPage,
        getCurrentEnvironment: mockGetCurrentEnvironment,
      };
    });
    const mod = require('../../../assets/admin/statuses.private');
    mod.statuses.forEach((fn) => (statusFunctions[fn.name] = fn));
    environmentFunction = mod.environment;
    backupEnv = helpers.backupEnv();
  });

  afterEach(() => {
    helpers.restoreEnv(backupEnv);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('checkEnvironmentInitialization is required to be deployed', async () => {
    // Arrange
    mockGetCurrentEnvironment.mockReturnValueOnce(Promise.resolve(undefined));

    // Act
    const status = await environmentFunction(CONTEXT);

    // Assert
    expect(status).toBeDefined();
    expect(status.valid).toBeFalsy();
    expect(status.description).toContain('deployed');
  });

  test('checkEnvironmentInitialization prompts to initialize if not yet initialized', async () => {
    // Arrange
    mockGetCurrentEnvironment.mockReturnValueOnce(
      Promise.resolve({ uniqueName: 'devtown' })
    );

    // Act
    const status = await environmentFunction(CONTEXT);

    // Assert
    expect(status).toBeDefined();
    expect(status.valid).toBeFalsy();
    expect(status.description).toContain('initialize');
    expect(status.actions[0].name).toContain('initialize');
  });

  test('checkEnvironmentInitialization is valid when initialized and deployed', async () => {
    // Arrange
    process.env.INITIALIZED = 'voice-javascript-sdk-quickstart';
    mockGetCurrentEnvironment.mockReturnValueOnce(
      Promise.resolve({ uniqueName: 'devtown' })
    );

    // Act
    const status = await environmentFunction(CONTEXT);

    // Assert
    expect(status).toBeDefined();
    expect(status.valid).toBeTruthy();
    expect(status.description).toContain('initialized');
  });

  test('getTwiMLApplicationStatus suggests to create if not found', async () => {
    // Act
    const status = await statusFunctions.getTwiMLApplicationStatus(CONTEXT);

    // Assert
    expect(status).toBeDefined();
    expect(status.valid).toBeFalsy();
    expect(status.description).toContain('create a new TwiML Application');
    expect(status.actions[0].name).toBe('createTwimlApp');
  });

  test('getTwiMLApplicationStatus finds TwiML Application based on APP_NAME', async () => {
    // Arrange
    process.env.APP_NAME = 'Example App';
    mockTwilioClient.applications.list.mockReturnValueOnce(
      Promise.resolve([
        {
          friendlyName: process.env.APP_NAME,
          sid: 'FOUND_APP_SID',
        },
      ])
    );

    // Act
    const status = await statusFunctions.getTwiMLApplicationStatus(CONTEXT);

    // Assert
    expect(status).toBeDefined();
    expect(status.valid).toBeFalsy();
    expect(status.description).toContain('found an existing');
    expect(status.actions[0].name).toBe('useExistingTwimlApp');
    expect(status.actions[0].params.twimlApplicationSid).toBe('FOUND_APP_SID');
    expect(status.actions[1].name).toBe('createTwimlApp');
    expect(status.actions[1].params.friendlyName).toBe('Example App');
  });

  test('getTwiMLApplicationStatus finds TwiML Application from environment', async () => {
    // Arrange
    process.env.TWIML_APPLICATION_SID = 'APP_SID';
    mockApplications.fetch.mockReturnValueOnce({
      friendlyName: 'Friendly Name',
      sid: 'APP_SID',
    });

    // Act
    const status = await statusFunctions.getTwiMLApplicationStatus(CONTEXT);

    // Assert
    expect(status).toBeDefined();
    expect(status.valid).toBeTruthy();
    // In Console link href
    expect(status.description).toContain('APP_SID');
    // In Console link text
    expect(status.description).toContain('Friendly Name');
  });

  test('getTwiMLApplicationStatus when set but App is non-existent, offers create new', async () => {
    // Arrange
    process.env.APP_NAME = 'Example App';
    process.env.TWIML_APPLICATION_SID = 'APP_SID';
    mockApplications.fetch.mockImplementationOnce(() => {
      throw new Error('Boom');
    });

    // Act
    const status = await statusFunctions.getTwiMLApplicationStatus(CONTEXT);

    // Assert
    expect(status).toBeDefined();
    expect(status.valid).toBeFalsy();
    // Couldn't find message
    expect(status.description).toContain('APP_SID');
    expect(status.actions[0].name).toBe('createTwimlApp');
    expect(status.actions[0].params.friendlyName).toBe('Example App');
  });

  test('getAPIKeyAndSecretFromEnvStatus suggests to create if environment not set', async () => {
    // Arrange
    process.env.APP_NAME = 'My Amazing App';

    // Act
    const result =
      await statusFunctions.getAPIKeyAndSecretFromEnvStatus(CONTEXT);

    // Assert
    expect(result).toBeDefined();
    expect(result.valid).toBeFalsy();
    expect(result.description).toContain('generate a new key');
    expect(result.actions[0].name).toBe('generateNewKey');
    expect(result.actions[0].params.friendlyName).toBe('My Amazing App');
  });

  test('getAPIKeyAndSecretFromEnvStatus creates a new key if the one in environment cannot be found', async () => {
    // Arrange
    process.env.APP_NAME = 'The best app';
    process.env.API_KEY = 'SK123';
    process.env.API_SECRET = 'shhh';
    mockKeys.fetch.mockImplementationOnce(() => {
      throw new Error('Not found!');
    });

    // Act
    const result =
      await statusFunctions.getAPIKeyAndSecretFromEnvStatus(CONTEXT);

    // Assert
    expect(mockKeys.fetch).toHaveBeenCalled();
    expect(result).toBeDefined();
    expect(result.valid).toBeFalsy();
    expect(result.description).toContain('unable to find');
    expect(result.actions[0].name).toBe('generateNewKey');
    expect(result.actions[0].params.friendlyName).toBe('The best app');
  });

  test('getAPIKeyAndSecretFromEnvStatus is valid when key exists', async () => {
    // Arrange
    process.env.APP_NAME = 'The best app';
    process.env.API_KEY = 'SK123';
    process.env.API_SECRET = 'shhh';
    mockKeys.fetch.mockReturnValue(
      Promise.resolve({
        sid: process.env.API_KEY,
        friendlyName: process.env.APP_NAME,
      })
    );

    // Act
    const result =
      await statusFunctions.getAPIKeyAndSecretFromEnvStatus(CONTEXT);

    // Assert
    expect(mockKeys.fetch).toHaveBeenCalled();
    expect(result).toBeDefined();
    expect(result.valid).toBeTruthy();
    // In the link
    expect(result.description).toContain(process.env.API_KEY);
    // Link description
    expect(result.description).toContain('The best app');
  });

  test('getCallerIdStatus suggests incoming numbers and verified ones if CALLER_ID not set', async () => {
    // Act
    const status = await statusFunctions.getCallerIdStatus(CONTEXT);

    // Assert
    expect(status).toBeDefined();
    expect(status.valid).toBeFalsy();
    expect(status.description).toContain('outgoing caller ID can be set');
    // Choose from the available incoming phone numbers and outgoing caller ids
    expect(status.actions.length).toBe(3);
  });

  test('getCallerIdStatus verifies that the supplied number is either a Twilio # or a Verified number', async () => {
    // Arrange
    process.env.CALLER_ID = '+13334445555';

    // Act
    const status = await statusFunctions.getCallerIdStatus(CONTEXT);

    // Assert
    expect(status).toBeDefined();
    expect(status.valid).toBeFalsy();
    expect(status.description).toContain('not yet verified');
  });

  test('getCallerIdStatus matches a verified number', async () => {
    /*
     * Arrange
     * Mocked in outgoingCallerIds.list
     */
    process.env.CALLER_ID = '+18001234567';

    // Act
    const status = await statusFunctions.getCallerIdStatus(CONTEXT);

    // Assert
    expect(status).toBeDefined();
    expect(status.valid).toBeTruthy();
    expect(status.description).toContain(process.env.CALLER_ID);
  });

  test('getTwiMLApplicationIsWiredUp is invalid when TwiML Application is missing', async () => {
    // Arrange
    process.env.TWIML_APPLICATION_SID = 'AP_NOT_FOUND_EVER';
    mockApplications.fetch.mockImplementationOnce(() => {
      throw new Error('Not found');
    });

    // Act
    const status = await statusFunctions.getTwiMLApplicationIsWiredUp(CONTEXT);

    // Assert
    expect(status).toBeDefined();
    expect(status.valid).toBeFalsy();
    expect(status.description).toContain("couldn't find your specified");
  });

  test("getTwiMLApplicationIsWiredUp is invalid when TwiML Application isn't yet set", async () => {
    // Act
    const status = await statusFunctions.getTwiMLApplicationIsWiredUp(CONTEXT);

    // Assert
    expect(status).toBeDefined();
    expect(status.valid).toBeFalsy();
    expect(status.description).toContain('you update your environment');
  });

  test("getTwiMLApplicationIsWiredUp is invalid when voiceUrl doesn't match", async () => {
    // Arrange
    process.env.TWIML_APPLICATION_SID = 'AP123';
    const expectedUrl = `https://${CONTEXT.DOMAIN_NAME}/voice-javascript-sdk-twiml-app`;
    const intentionallyWrongUrl = 'https://spacejam.com/twiml';
    mockApplications.fetch.mockReturnValueOnce(
      Promise.resolve({
        sid: process.env.TWIML_APPLICATION_SID,
        voiceUrl: intentionallyWrongUrl,
      })
    );

    // Act
    const status = await statusFunctions.getTwiMLApplicationIsWiredUp(CONTEXT);

    // Assert
    expect(status).toBeDefined();
    expect(status.valid).toBeFalsy();
    // In display
    expect(status.description).toContain(intentionallyWrongUrl);
    expect(status.description).toContain(expectedUrl);
    expect(status.actions[0].name).toBe('updateTwimlAppVoiceUrl');
    expect(status.actions[0].params.twimlApplicationSid).toBe(
      process.env.TWIML_APPLICATION_SID
    );
    expect(status.actions[0].params.voiceUrl).toBe(expectedUrl);
  });

  test('getTwiMLApplicationIsWiredUp is valid when voiceUrl matches', async () => {
    // Arrange
    process.env.TWIML_APPLICATION_SID = 'AP123';
    const expectedUrl = `https://${CONTEXT.DOMAIN_NAME}/voice-javascript-sdk-twiml-app`;
    mockApplications.fetch.mockReturnValueOnce(
      Promise.resolve({
        sid: process.env.TWIML_APPLICATION_SID,
        voiceUrl: expectedUrl,
      })
    );

    // Act
    const status = await statusFunctions.getTwiMLApplicationIsWiredUp(CONTEXT);

    // Assert
    expect(status).toBeDefined();
    expect(status.valid).toBeTruthy();
    // In display
    expect(status.description).toContain(expectedUrl);
  });

  test('getDefaultPasswordChanged is invalid if the default is used', async () => {
    // Arrange
    process.env.ADMIN_PASSWORD = 'default';

    // Act
    const status = await statusFunctions.getDefaultPasswordChanged(CONTEXT);

    // Assert
    expect(status).toBeDefined();
    expect(status.valid).toBeFalsy();
    expect(status.description).toContain('`.env`');
  });

  test('getDefaultPasswordChanged is valid with different password', async () => {
    // Arrange
    process.env.ADMIN_PASSWORD = 'ch@ng3d';

    // Act
    const status = await statusFunctions.getDefaultPasswordChanged(CONTEXT);

    // Assert
    expect(status).toBeDefined();
    expect(status.valid).toBeTruthy();
    expect(status.description).toContain('all set');
  });
});
