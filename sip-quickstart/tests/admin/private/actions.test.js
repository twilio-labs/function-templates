const helpers = require('../../../../test/test-helper');
const extensions = require('../../../assets/extensions.private');

let actions;

const DUMMY_CREDENTIAL_LIST_SID = 'CL123';
const DUMMY_SIP_DOMAIN_SID = 'SD123';

const mockTwilioClient = {
  sip: {},
};
const mockSipDomainUpdate = jest.fn();
const mockCredentialListUpdate = jest.fn();
const mockAuthCallsCredentialListMappingsCreate = jest.fn();
const mockAuthRegistrationsCredentialListMappingsCreate = jest.fn();
const mockCredentialCreate = jest.fn();
const mockIncomingPhoneNumberFetch = jest.fn();

mockTwilioClient.sip.domains = jest.fn(() => {
  return {
    update: mockSipDomainUpdate,
    auth: {
      calls: {
        credentialListMappings: {
          create: mockAuthCallsCredentialListMappingsCreate,
        },
      },
      registrations: {
        credentialListMappings: {
          create: mockAuthRegistrationsCredentialListMappingsCreate,
        },
      },
    },
  };
});
mockTwilioClient.sip.domains.create = jest.fn(() =>
  Promise.resolve({ sid: DUMMY_SIP_DOMAIN_SID })
);
mockTwilioClient.sip.domains.list = jest.fn();
mockTwilioClient.sip.credentialLists = jest.fn(() => {
  return {
    update: mockCredentialListUpdate,
    credentials: {
      create: mockCredentialCreate,
    },
  };
});
mockTwilioClient.sip.credentialLists.create = jest.fn(() =>
  Promise.resolve({ sid: DUMMY_CREDENTIAL_LIST_SID })
);
mockTwilioClient.incomingPhoneNumbers = jest.fn(() => {
  return {
    fetch: mockIncomingPhoneNumberFetch,
  };
});
mockTwilioClient.incomingPhoneNumbers.list = jest.fn();
mockTwilioClient.outgoingCallerIds = {
  list: jest.fn(),
};

describe('sip-quickstart/admin/private/actions', () => {
  beforeAll(() => {
    const runtime = new helpers.MockRuntime();
    runtime._addAsset(
      '/extensions.js',
      '../../../assets/extensions.private.js'
    );
    runtime._addAsset(
      '/admin/shared.js',
      '../../../assets/admin/shared.private.js'
    );
    helpers.setup({}, runtime);
    const Actions = require('../../../assets/admin/actions.private.js');
    options = {
      friendlyName: 'Example App',
      DOMAIN_NAME: 'blargh-duck-123.twil.io',
      PATH: '/admin/perform-action',
    };
    actions = new Actions(mockTwilioClient, options);
  });
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('createSipDomain creates and returns a SIP Domain SID', async () => {
    // Act
    const result = await actions.createSipDomain({
      friendlyName: 'Example Domain',
      domainName: 'example-domain',
    });

    // Assert
    // TODO: Defaults
    expect(mockTwilioClient.sip.domains.create).toHaveBeenCalledWith({
      friendlyName: 'Example Domain',
      domainName: 'example-domain',
    });
    expect(result).toBeDefined();
    expect(result.SIP_DOMAIN_SID).toBe(DUMMY_SIP_DOMAIN_SID);
  });

  test('createSipDomain will try and see if a same named domain already exists on an error', async () => {
    // Arrange
    mockTwilioClient.sip.domains.create.mockImplementationOnce(() => {
      throw new Error('It already exists!');
    });
    mockTwilioClient.sip.domains.list.mockReturnValueOnce(
      Promise.resolve([
        {
          sid: 'SDNOTIT',
          domainName: 'nope.sip.twil.io',
        },
        {
          sid: 'SDWINNER',
          domainName: 'winner-chicken-dinner-123.sip.twil.io',
        },
      ])
    );

    // Act
    const results = await actions.createSipDomain({
      friendlyName: 'Friendly',
      domainName: 'winner-chicken-dinner-123',
    });

    // Assert
    expect(mockTwilioClient.sip.domains.list).toHaveBeenCalled();
    expect(results.SIP_DOMAIN_SID).toBe('SDWINNER');
  });

  test("createSipDomain doesn't return if domain exists but not in current account", async () => {
    // Arrange
    mockTwilioClient.sip.domains.list.mockReturnValueOnce(Promise.resolve([]));
    mockTwilioClient.sip.domains.create.mockImplementationOnce(() => {
      throw new Error('It already exists!');
    });

    // Act
    const results = await actions.createSipDomain({
      friendlyName: 'Friendly',
      domainName: 'someone-else-got-this-already',
    });

    // Assert
    expect(mockTwilioClient.sip.domains.list).toHaveBeenCalled();
    expect(results).toBeUndefined();
  });

  test('updateSipDomainVoiceUrl updates SIP Domain', async () => {
    // Act
    await actions.updateSipDomainVoiceUrl({
      sipDomainSid: DUMMY_SIP_DOMAIN_SID,
      voiceUrl: 'https://spacejam.com/twiml',
    });

    // Assert
    expect(mockTwilioClient.sip.domains).toHaveBeenCalledWith(
      DUMMY_SIP_DOMAIN_SID
    );
    expect(mockSipDomainUpdate).toHaveBeenCalledWith({
      voiceUrl: 'https://spacejam.com/twiml',
    });
  });

  test('createMappedCredentialList maps registration and calls and sets domain to allow for registration', async () => {
    // Arrange
    const friendlyName = 'Friendly Canary';
    const sipDomainSid = 'SDCANARY';

    // Act
    const results = await actions.createMappedCredentialList({
      friendlyName,
      sipDomainSid,
    });

    // Assert
    expect(mockTwilioClient.sip.credentialLists.create).toHaveBeenCalledWith({
      friendlyName,
    });
    expect(results.CREDENTIAL_LIST_SID).toBe(DUMMY_CREDENTIAL_LIST_SID);
    // Check side effects
    expect(mockTwilioClient.sip.domains).toHaveBeenCalledWith(sipDomainSid);
    expect(mockAuthCallsCredentialListMappingsCreate).toHaveBeenCalledWith({
      credentialListSid: DUMMY_CREDENTIAL_LIST_SID,
    });
    expect(
      mockAuthRegistrationsCredentialListMappingsCreate
    ).toHaveBeenCalledWith({ credentialListSid: DUMMY_CREDENTIAL_LIST_SID });
    expect(mockSipDomainUpdate).toHaveBeenCalledWith({ sipRegistration: true });
  });

  test('createDefaultCredentialListForDomain creates uniquely named credential list and adds credentials', async () => {
    //Act
    const result = await actions.createDefaultCredentialListForDomain({
      sipDomainSid: DUMMY_SIP_DOMAIN_SID,
    });

    //Assert
    expect(mockTwilioClient.sip.credentialLists.create).toHaveBeenCalledWith({
      friendlyName: 'Example App (blargh-duck-123)',
    });

    extensions.forEach((ext) =>
      expect(mockCredentialCreate).toHaveBeenCalledWith({
        username: ext.username,
      })
    );
  });

  test('addNewCredential takes a password', async () => {
    await actions.addNewCredential({
      credentialListSid: 'CL123',
      username: 'user',
      password: 'pass',
    });

    expect(mockCredentialCreate).toHaveBeenCalledWith({
      username: 'user',
      password: 'pass',
    });
  });

  test('addNewCredential uses default password if not set', async () => {
    // Arrange
    process.env.DEFAULT_SIP_USER_PASSWORD = 'canary';

    // Act
    await actions.addNewCredential({
      credentialListSid: 'CL123',
      username: 'cole',
    });

    // Assert
    expect(mockCredentialCreate).toHaveBeenCalledWith({
      username: 'cole',
      password: 'canary',
    });
  });

  test('setCallerId passes thru appropriate environment variable', async () => {
    const results = await actions.setCallerId({ number: '+1555123456' });
    expect(results.CALLER_ID).toBe('+1555123456');
  });

  test('useExistingSipDomain passes thru appropriate environment variables', async () => {
    const results = await actions.useExistingSipDomain({
      sipDomainSid: 'SD456',
    });
    expect(results.SIP_DOMAIN_SID).toBe('SD456');
  });

  test('chooseLogicalIncomingNumber returns undefined if not found', async () => {
    // Arrange
    mockTwilioClient.incomingPhoneNumbers.list.mockReturnValueOnce(
      Promise.resolve([
        {
          phoneNumber: '+15551112222',
          voiceUrl: 'spacejam.com/twiml',
        },
      ])
    );

    // Act
    const results = await actions.chooseLogicalIncomingNumber();

    // Assert
    expect(results).toBeUndefined();
  });

  test('chooseLogicalIncomingNumber returns number with default url', async () => {
    // Arrange
    mockTwilioClient.incomingPhoneNumbers.list.mockReturnValueOnce(
      Promise.resolve([
        {
          phoneNumber: '+15551112222',
          voiceUrl: 'https://demo.twilio.com/welcome/voice/',
        },
      ])
    );

    // Act
    const results = await actions.chooseLogicalIncomingNumber();

    // Assert
    expect(results).toBeDefined();
    expect(results.phoneNumber).toBe('+15551112222');
  });

  test('clearIncomingNumber returns a result that will remove the incoming number', async () => {
    const results = actions.clearIncomingNumber();
    expect(results.INCOMING_NUMBER).toBe(undefined);
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

  test('updateIncomingNumber updates environment and voiceUrl', async () => {
    // Arrange
    const mockUpdate = jest.fn();
    mockIncomingPhoneNumberFetch.mockReturnValueOnce(
      Promise.resolve({
        update: mockUpdate,
        sid: 'PN123',
        phoneNumber: '+15552223333',
      })
    );

    // Act
    const results = await actions.updateIncomingNumber({
      sid: 'PN123',
      voiceUrl: 'https://spacejam.com/twiml',
    });

    // Assert
    expect(results).toBeDefined();
    expect(results.INCOMING_NUMBER).toBe('+15552223333');
    expect(mockTwilioClient.incomingPhoneNumbers).toHaveBeenCalledWith('PN123');
    expect(mockIncomingPhoneNumberFetch).toHaveBeenCalled();
    expect(mockUpdate).toHaveBeenCalledWith({
      voiceUrl: 'https://spacejam.com/twiml',
    });
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
      {
        phoneNumber: '+15551213434',
        voiceUrl: 'https://set-to-something.com/twiml',
      },
    ]);

    // Act
    // options are passed into the constructor
    const results = await actions.initialize();

    // Assert
    expect(results).toBeDefined();
    // These actions are specific to this codebase (cannot be overridden)
    expect(results.INITIALIZED).toBe('sip-quickstart');
    expect(results.INITIALIZATION_DATE).toBeDefined();
    expect(results.SIP_DOMAIN_SID).toBe('SD123');
    // Updates the new TwiML App with the function
    expect(mockTwilioClient.sip.domains).toHaveBeenCalledWith('SD123');
    expect(mockSipDomainUpdate).toHaveBeenCalledWith({
      voiceUrl: 'https://blargh-duck-123.twil.io/outbound-calls',
    });
    expect(results.CALLER_ID).toBe('+15551213434');
  });

  test('initialize to setup incoming phone number when logical one is found', async () => {
    // Arrange
    const mockUpdate = jest.fn();
    const mockNumber = {
      update: mockUpdate,
      phoneNumber: '+15551112222',
      voiceUrl: 'https://demo.twilio.com/welcome/voice/',
    };
    mockTwilioClient.incomingPhoneNumbers.list.mockReturnValueOnce(
      Promise.resolve([mockNumber])
    );
    mockIncomingPhoneNumberFetch.mockReturnValueOnce(
      Promise.resolve(mockNumber)
    );

    // Act
    const results = await actions.initialize();

    expect(results).toBeDefined();
    expect(results.INCOMING_NUMBER).toBe('+15551112222');
    expect(results.CALLER_ID).toBe('+15551112222');
    expect(mockUpdate).toHaveBeenCalledWith({
      voiceUrl: 'https://blargh-duck-123.twil.io/extension-menu',
    });
  });
});
