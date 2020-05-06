const helpers = require("../../../../test/test-helper");

const statusFunctions = {};
let environmentFunction;
let mockGetCurrentEnvironment;

const mockDomains = {
  fetch: jest.fn(),
};

const mockKeys = {
  fetch: jest.fn(),
};

const mockTwilioClient = {
  sip: {}
};
mockTwilioClient.sip.domains = jest.fn(() => mockDomains);
mockTwilioClient.sip.domains.list = jest.fn(() => Promise.resolve([]));
mockTwilioClient.incomingPhoneNumbers = {
  list: jest.fn(() => [
    {
      phoneNumber: "+15551234567",
      friendlyName: "(555) 123-4567",
    },
    {
      phoneNumber: "+15557654321",
      friendlyName: "My Business line",
    },
  ]),
};
mockTwilioClient.outgoingCallerIds = {
  list: jest.fn(() => [
    {
      phoneNumber: "+18001234567",
      friendlyName: "My Toll Free",
    },
  ]),
};

const CONTEXT = {
  ACCOUNT_SID: "AC123",
  AUTH_TOKEN: "0a123",
  DOMAIN_NAME: "testing-domain-123.com",
  PATH: "/check-status",
  getTwilioClient: jest.fn(() => mockTwilioClient),
};

let backupEnv;

describe("sip-quickstart/admin/private/statuses", () => {
  beforeAll(() => {
    const runtime = new helpers.MockRuntime();
    runtime._addAsset(
      "/admin/shared.js",
      "../../../assets/admin/shared.private.js"
    );
    helpers.setup(CONTEXT, runtime);
    // Mock out shared
    mockGetCurrentEnvironment = jest.fn();
    const mockShared = jest.mock("../../../assets/admin/shared.private", () => {
      const actualShared = jest.requireActual("../../../assets/admin/shared.private");
      return {
        urlForSiblingPage: actualShared.urlForSiblingPage,
        getCurrentEnvironment: mockGetCurrentEnvironment
      };
    });
    const mod = require("../../../assets/admin/statuses.private");
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

  test("checkEnvironmentInitialization is required to be deployed", async () => {
    // Arrange
    mockGetCurrentEnvironment.mockReturnValueOnce(Promise.resolve(undefined));

    // Act
    const status = await environmentFunction(CONTEXT);

    // Assert
    expect(status).toBeDefined();
    expect(status.valid).toBeFalsy();
    expect(status.description).toContain("deployed");
  });

  test("checkEnvironmentInitialization prompts to initialize if not yet initialized", async () => {
    // Arrange
    mockGetCurrentEnvironment.mockReturnValueOnce(Promise.resolve({uniqueName: "devtown"}));

    // Act
    const status = await environmentFunction(CONTEXT);

    // Assert
    expect(status).toBeDefined();
    expect(status.valid).toBeFalsy();
    expect(status.description).toContain("initialize");
    expect(status.actions[0].name).toContain("initialize");
  });

  test("checkEnvironmentInitialization is valid when initialized and deployed", async () => {
    // Arrange
    process.env.INITIALIZED = "sip-quickstart";
    mockGetCurrentEnvironment.mockReturnValueOnce(Promise.resolve({uniqueName: "devtown"}));

    // Act
    const status = await environmentFunction(CONTEXT);

    // Assert
    expect(status).toBeDefined();
    expect(status.valid).toBeTruthy();
    expect(status.description).toContain("initialized");
  });


  test("getSipDomainStatus suggests to create if not found", async () => {
    // Act
    const status = await statusFunctions.getSipDomainStatus(CONTEXT);

    // Assert
    expect(status).toBeDefined();
    expect(status.valid).toBeFalsy();
    expect(status.description).toContain("create a new SIP Domain");
    expect(status.actions[0].name).toBe("createSipDomain");
  });

  test("getSipDomainStatus finds SIP Domain based on function's domain", async () => {
    // Arrange
    process.env.APP_NAME = "Example App";
    mockTwilioClient.sip.domains.list.mockReturnValueOnce(
      Promise.resolve([
        {
          friendlyName: process.env.APP_NAME,
          domainName: CONTEXT.DOMAIN_NAME,
          sid: "FOUND_SIP_DOMAIN_SID",
        },
      ])
    );

    // Act
    const status = await statusFunctions.getSipDomainStatus(CONTEXT);

    // Assert
    expect(status).toBeDefined();
    expect(status.valid).toBeFalsy();
    expect(status.description).toContain("found an existing");
    expect(status.actions[0].name).toBe("useExistingSipDomain");
    expect(status.actions[0].params.sipDomainSid).toBe("FOUND_SIP_DOMAIN_SID");
    expect(status.actions[1].name).toBe("createSipDomain");
    expect(status.actions[1].params.friendlyName).toBe("Example App");
    expect(status.actions[1].params.domainName).toBe("testing-domain-123.com");
  });

  test("getSipDomainStatus finds SIP Domain from environment", async () => {
    // Arrange
    process.env.SIP_DOMAIN_SID = "SIP_DOMAIN_SID";
    mockDomains.fetch.mockReturnValueOnce({
      friendlyName: "Friendly Name",
      domainName: "domain-name",
      sid: "SIP_DOMAIN_SID",
    });

    // Act
    const status = await statusFunctions.getSipDomainStatus(CONTEXT);

    // Assert
    expect(status).toBeDefined();
    expect(status.valid).toBeTruthy();
    // In Console link href
    expect(status.description).toContain("SIP_DOMAIN_SID");
    // In Console link text
    expect(status.description).toContain("Friendly Name");
  });

  test("getSipDomainStatus when set but SIP Domain is non-existent, offers create new", async () => {
    // Arrange
    process.env.APP_NAME = "Example App";
    process.env.SIP_DOMAIN_SID = "SIP_DOMAIN_SID";
    mockDomains.fetch.mockImplementationOnce(() => {
      throw new Error("Boom");
    });

    // Act
    const status = await statusFunctions.getSipDomainStatus(CONTEXT);

    // Assert
    expect(status).toBeDefined();
    expect(status.valid).toBeFalsy();
    // Couldn't find message
    expect(status.description).toContain("SIP_DOMAIN_SID");
    expect(status.actions[0].name).toBe("createSipDomain");
    expect(status.actions[0].params.friendlyName).toBe("Example App");
  });

  test("getCallerIdStatus suggests incoming numbers and verified ones if CALLER_ID not set", async () => {
    // Act
    const status = await statusFunctions.getCallerIdStatus(CONTEXT);

    // Assert
    expect(status).toBeDefined();
    expect(status.valid).toBeFalsy();
    expect(status.description).toContain("outgoing caller ID can be set");
    // Choose from the available incoming phone numbers and outgoing caller ids
    expect(status.actions.length).toBe(3);
  });

  test("getCallerIdStatus verifies that the supplied number is either a Twilio # or a Verified number", async () => {
    //Arrange
    process.env.CALLER_ID = "+13334445555";

    // Act 
    const status = await statusFunctions.getCallerIdStatus(CONTEXT);

    // Assert
    expect(status).toBeDefined();
    expect(status.valid).toBeFalsy();
    expect(status.description).toContain("not yet verified");
  });

  test("getCallerIdStatus matches a verified number", async () => {
    // Arrange
    // Mocked in outgoingCallerIds.list
    process.env.CALLER_ID = "+18001234567";

    //Act
    const status = await statusFunctions.getCallerIdStatus(CONTEXT);

    // Assert
    expect(status).toBeDefined();
    expect(status.valid).toBeTruthy();
    expect(status.description).toContain(process.env.CALLER_ID);
  });

  test("getSipDomainIsWiredUp is invalid when SIP Domain is missing", async () => {
    // Arrange
    process.env.SIP_DOMAIN_SID = "SIP_DOMAIN_NOT_FOUND_EVER";
    mockDomains.fetch.mockImplementationOnce(() => {throw new Error("Not found");});

    // Act
    const status = await statusFunctions.getSipDomainIsWiredUp(CONTEXT);

    // Assert
    expect(status).toBeDefined();
    expect(status.valid).toBeFalsy();
    expect(status.description).toContain("couldn't find your specified");
  });

  test("getSipDomainIsWiredUp is invalid when SIP Domain isn't yet set", async () => {
    // Act
    const status = await statusFunctions.getSipDomainIsWiredUp(CONTEXT);

    // Assert
    expect(status).toBeDefined();
    expect(status.valid).toBeFalsy();
    expect(status.description).toContain("you update your environment");
  });

  test("getSipDomainIsWiredUp is invalid when voiceUrl doesn't match", async () => {
    // Arrange
    process.env.SIP_DOMAIN_SID = "SD123";
    const expectedUrl = `https://${CONTEXT.DOMAIN_NAME}/outgoing-calls`;
    const intentionallyWrongUrl = "https://spacejam.com/twiml";
    mockDomains.fetch.mockReturnValueOnce(Promise.resolve({
      sid: process.env.SIP_DOMAIN_SID,
      voiceUrl: intentionallyWrongUrl
    }));

    // Act
    const status = await statusFunctions.getSipDomainIsWiredUp(CONTEXT);

    // Assert
    expect(status).toBeDefined();
    expect(status.valid).toBeFalsy();
    // In display
    expect(status.description).toContain(intentionallyWrongUrl);
    expect(status.description).toContain(expectedUrl);
    expect(status.actions[0].name).toBe("updateSipDomainVoiceUrl");
    expect(status.actions[0].params.sipDomainSid).toBe(process.env.SIP_DOMAIN_SID);
    expect(status.actions[0].params.voiceUrl).toBe(expectedUrl);
  });


  test("getSipDomainIsWiredUp is valid when voiceUrl matches", async () => {
    // Arrange
    process.env.SIP_DOMAIN_SID = "SD123";
    const expectedUrl = `https://${CONTEXT.DOMAIN_NAME}/outgoing-calls`;
    mockDomains.fetch.mockReturnValueOnce(Promise.resolve({
      sid: process.env.SIP_DOMAIN_SID,
      voiceUrl: expectedUrl
    }));

    // Act
    const status = await statusFunctions.getSipDomainIsWiredUp(CONTEXT);

    // Assert
    expect(status).toBeDefined();
    expect(status.valid).toBeTruthy();
    // In display
    expect(status.description).toContain(expectedUrl);
  });

  test("getDefaultPasswordChanged is invalid if the default is used", async () => {
    // Arrange
    process.env.ADMIN_PASSWORD = "default";

    // Act
    const status = await statusFunctions.getDefaultPasswordChanged(CONTEXT);

    // Assert
    expect(status).toBeDefined();
    expect(status.valid).toBeFalsy();
    expect(status.description).toContain("`.env`");
  });

  test("getDefaultPasswordChanged is valid with different password", async () => {
    // Arrange
    process.env.ADMIN_PASSWORD = "ch@ng3d";

    // Act
    const status = await statusFunctions.getDefaultPasswordChanged(CONTEXT);

    // Assert
    expect(status).toBeDefined();
    expect(status.valid).toBeTruthy();
    expect(status.description).toContain("all set");
  });

});
