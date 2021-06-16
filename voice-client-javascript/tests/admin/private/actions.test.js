const helpers = require('../../../../test/test-helper');

let actions;

const mockTwilioClient = {};
const mockApplicationsUpdate = jest.fn();
mockTwilioClient.applications = jest.fn(() => {
  return { update: mockApplicationsUpdate };
});
mockTwilioClient.applications.create = jest.fn(() =>
  Promise.resolve({ sid: 'AP123' })
);
mockTwilioClient.newKeys = {
  create: jest.fn(() => {
    return {
      sid: 'SK123',
      secret: 'shhh',
    };
  }),
};
mockTwilioClient.incomingPhoneNumbers = {
  list: jest.fn(),
};
mockTwilioClient.outgoingCallerIds = {
  list: jest.fn(),
};

describe('voice-client-javascript/admin/private/actions', () => {
  beforeAll(() => {
    const runtime = new helpers.MockRuntime();
    runtime._addAsset(
      '/admin/shared.js',
      '../../../assets/admin/shared.private.js'
    );
    helpers.setup({}, runtime);
    const Actions = require('../../../assets/admin/actions.private');
    options = {
      friendlyName: 'Example App',
      DOMAIN_NAME: 'blargh-duck-123.com',
      PATH: '/admin/perform-action',
    };
    actions = new Actions(mockTwilioClient, options);
  });
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('createTwimlApp creates and returns a TwiML App', async () => {
    // Act
    const result = await actions.createTwimlApp({
      friendlyName: 'Example App',
    });

    // Assert
    expect(mockTwilioClient.applications.create).toHaveBeenCalledWith({
      friendlyName: 'Example App',
    });
    expect(result).toBeDefined();
    expect(result.TWIML_APPLICATION_SID).toBe('AP123');
  });

  test('updateTwimlAppVoiceUrl updates TwiML App', async () => {
    // Act
    await actions.updateTwimlAppVoiceUrl({
      twimlApplicationSid: 'AP123',
      voiceUrl: 'https://spacejam.com/twiml',
    });

    // Assert
    expect(mockTwilioClient.applications).toHaveBeenCalledWith('AP123');
    expect(mockApplicationsUpdate).toHaveBeenCalledWith({
      voiceUrl: 'https://spacejam.com/twiml',
    });
  });

  test('generateNewKey makes a new REST API Key', async () => {
    // Act
    const result = await actions.generateNewKey({ friendlyName: 'Test Key' });

    // Assert
    expect(result).toBeDefined();
    expect(result.API_KEY).toBe('SK123');
    expect(result.API_SECRET).toBe('shhh');
    expect(mockTwilioClient.newKeys.create).toHaveBeenCalledWith({
      friendlyName: 'Test Key',
    });
  });

  test('setCallerId passes thru appropriate environment variable', async () => {
    const results = await actions.setCallerId({ number: '+1555123456' });
    expect(results.CALLER_ID).toBe('+1555123456');
  });

  test('useExistingTwimlApp passes thru appropriate environment variables', async () => {
    const results = await actions.useExistingTwimlApp({
      twimlApplicationSid: 'AP456',
    });
    expect(results.TWIML_APPLICATION_SID).toBe('AP456');
  });

  test('chooseLogicalCallerId chooses incoming the first incoming number that exists', async () => {
    // Arrange
    mockTwilioClient.incomingPhoneNumbers.list.mockReturnValue([
      { phoneNumber: '+15557654321' },
    ]);

    // Act
    const result = await actions.chooseLogicalCallerId();

    // Assert
    expect(result).toBe('+15557654321');
    expect(mockTwilioClient.incomingPhoneNumbers.list).toHaveBeenCalled();
  });
  test('chooseLogicalCallerId chooses verified number if there are no incoming phone numbers', async () => {
    // Arrange
    mockTwilioClient.incomingPhoneNumbers.list.mockReturnValue([]);
    mockTwilioClient.outgoingCallerIds.list.mockReturnValue([
      { phoneNumber: '+15553336666' },
    ]);

    // Act
    const result = await actions.chooseLogicalCallerId();

    // Assert
    expect(result).toBe('+15553336666');
    expect(mockTwilioClient.incomingPhoneNumbers.list).toHaveBeenCalled();
    expect(mockTwilioClient.outgoingCallerIds.list).toHaveBeenCalled();
  });

  test('initialize will setup all the things from options', async () => {
    // Arrange
    mockTwilioClient.incomingPhoneNumbers.list.mockReturnValue([
      { phoneNumber: '+15551213434' },
    ]);

    /*
     * Act
     * options are passed into the constructor
     */
    const results = await actions.initialize();

    // Assert
    expect(results).toBeDefined();
    // These actions are specific to this codebase (cannot be overridden)
    expect(results.INITIALIZED).toBe('voice-client-quickstart');
    expect(results.INITIALIZATION_DATE).toBeDefined();
    expect(results.TWIML_APPLICATION_SID).toBe('AP123');
    // Updates the new TwiML App with the function
    expect(mockTwilioClient.applications).toHaveBeenCalledWith('AP123');
    expect(mockApplicationsUpdate).toHaveBeenCalledWith({
      voiceUrl: 'https://blargh-duck-123.com/client-voice-twiml-app',
    });
    // API Key is created with the friendly name
    expect(results.API_KEY).toBe('SK123');
    expect(results.API_SECRET).toBe('shhh');
    expect(mockTwilioClient.newKeys.create).toHaveBeenCalledWith({
      friendlyName: 'Example App',
    });
    expect(results.CALLER_ID).toBe('+15551213434');
  });
});
