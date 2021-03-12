const helpers = require("../../../../test/test-helper");

const statusFunctions = {};
let environmentFunction;
let mockGetCurrentEnvironment;

const mockApplications = {
  fetch: jest.fn(),
};

const mockKeys = {
  fetch: jest.fn(),
};

const fixtureIncomingNumbers = [
  {
    phoneNumber: "+15551234567",
    friendlyName: "(555) 123-4567",
    sid: "PN123",
  },
  {
    phoneNumber: "+15557654321",
    friendlyName: "My Business line",
    sid: "PN456",
  },
];

const mockTwilioClient = {};
mockTwilioClient.applications = jest.fn(() => mockApplications);
mockTwilioClient.applications.list = jest.fn(() => Promise.resolve([]));
mockTwilioClient.keys = jest.fn(() => mockKeys);
mockTwilioClient.incomingPhoneNumbers = {
  list: jest.fn(() => fixtureIncomingNumbers),
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

function createContext(additional = {}) {
  return { ...additional, ...CONTEXT };
}

let backupEnv;

describe("voice-client-javascript/admin/private/statuses", () => {
  beforeAll(() => {
    const runtime = new helpers.MockRuntime();
    runtime._addAsset(
      "/admin/shared.js",
      "../../../assets/admin/shared.private.js"
    );
    helpers.setup(createContext(), runtime);
    // Mock out shared
    mockGetCurrentEnvironment = jest.fn();
    const mockShared = jest.mock("../../../assets/admin/shared.private", () => {
      const actualShared = jest.requireActual(
        "../../../assets/admin/shared.private"
      );
      return {
        urlForSiblingPage: actualShared.urlForSiblingPage,
        getCurrentEnvironment: mockGetCurrentEnvironment,
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
    const status = await environmentFunction(createContext());

    // Assert
    expect(status).toBeDefined();
    expect(status.valid).toBeFalsy();
    expect(status.description).toContain("deployed");
  });

  test("checkEnvironmentInitialization prompts to initialize if not yet initialized", async () => {
    // Arrange
    mockGetCurrentEnvironment.mockReturnValueOnce(
      Promise.resolve({ uniqueName: "devtown" })
    );

    // Act
    const status = await environmentFunction(createContext());

    // Assert
    expect(status).toBeDefined();
    expect(status.valid).toBeFalsy();
    expect(status.description).toContain("initialize");
    expect(status.actions[0].name).toContain("initialize");
  });

  test("checkEnvironmentInitialization is valid when initialized and deployed", async () => {
    // Arrange
    const INITIALIZED = "voice-client-quickstart";
    const context = createContext({ INITIALIZED });
    mockGetCurrentEnvironment.mockReturnValueOnce(
      Promise.resolve({ uniqueName: "devtown" })
    );

    // Act
    const status = await environmentFunction(context);

    // Assert
    expect(status).toBeDefined();
    expect(status.valid).toBeTruthy();
    expect(status.description).toContain("initialized");
  });

  test("getTwiMLApplicationStatus suggests to create if not found", async () => {
    // Act
    const status = await statusFunctions.getTwiMLApplicationStatus(
      createContext()
    );

    // Assert
    expect(status).toBeDefined();
    expect(status.valid).toBeFalsy();
    expect(status.description).toContain("create a new TwiML Application");
    expect(status.actions[0].name).toBe("createTwimlApp");
  });

  test("getTwiMLApplicationStatus finds TwiML Application based on APP_NAME", async () => {
    const APP_NAME = "Example App";
    const context = createContext({ APP_NAME });
    // Arrange
    mockTwilioClient.applications.list.mockReturnValueOnce(
      Promise.resolve([
        {
          friendlyName: context.APP_NAME,
          sid: "FOUND_APP_SID",
        },
      ])
    );

    // Act
    const status = await statusFunctions.getTwiMLApplicationStatus(context);

    // Assert
    expect(status).toBeDefined();
    expect(status.valid).toBeFalsy();
    expect(status.description).toContain("found an existing");
    expect(status.actions[0].name).toBe("useExistingTwimlApp");
    expect(status.actions[0].params.twimlApplicationSid).toBe("FOUND_APP_SID");
    expect(status.actions[1].name).toBe("createTwimlApp");
    expect(status.actions[1].params.friendlyName).toBe("Example App");
  });

  test("getTwiMLApplicationStatus finds TwiML Application from environment", async () => {
    // Arrange
    const TWIML_APPLICATION_SID = "APP_SID";
    const context = createContext({TWIML_APPLICATION_SID});
    mockApplications.fetch.mockReturnValueOnce({
      friendlyName: "Friendly Name",
      sid: "APP_SID",
    });

    // Act
    const status = await statusFunctions.getTwiMLApplicationStatus(context);

    // Assert
    expect(status).toBeDefined();
    expect(status.valid).toBeTruthy();
    // In Console link href
    expect(status.description).toContain("APP_SID");
    // In Console link text
    expect(status.description).toContain("Friendly Name");
  });

  test("getTwiMLApplicationStatus when set but App is non-existent, offers create new", async () => {
    // Arrange
    const APP_NAME = "Example App";
    const TWIML_APPLICATION_SID = "APP_SID";
    const context = createContext({ APP_NAME, TWIML_APPLICATION_SID });
    mockApplications.fetch.mockImplementationOnce(() => {
      throw new Error("Boom");
    });

    // Act
    const status = await statusFunctions.getTwiMLApplicationStatus(context);

    // Assert
    expect(status).toBeDefined();
    expect(status.valid).toBeFalsy();
    // Couldn't find message
    expect(status.description).toContain("APP_SID");
    expect(status.actions[0].name).toBe("createTwimlApp");
    expect(status.actions[0].params.friendlyName).toBe("Example App");
  });

  test("getAPIKeyAndSecretFromEnvStatus suggests to create if environment not set", async () => {
    // Arrange
    const APP_NAME = "My Amazing App";
    const context = createContext({ APP_NAME });

    // Act
    const result = await statusFunctions.getAPIKeyAndSecretFromEnvStatus(
      context
    );

    //Assert
    expect(result).toBeDefined();
    expect(result.valid).toBeFalsy();
    expect(result.description).toContain("generate a new key");
    expect(result.actions[0].name).toBe("generateNewKey");
    expect(result.actions[0].params.friendlyName).toBe("My Amazing App");
  });

  test("getAPIKeyAndSecretFromEnvStatus creates a new key if the one in environment cannot be found", async () => {
    // Arrange
    const APP_NAME = "The best app";
    const API_KEY = "SK123";
    const API_SECRET = "shhh";
    const context = createContext({ APP_NAME, API_KEY, API_SECRET });
    mockKeys.fetch.mockImplementationOnce(() => {
      throw new Error("Not found!");
    });

    // Act
    const result = await statusFunctions.getAPIKeyAndSecretFromEnvStatus(
      context
    );

    //Assert
    expect(mockKeys.fetch).toHaveBeenCalled();
    expect(result).toBeDefined();
    expect(result.valid).toBeFalsy();
    expect(result.description).toContain("unable to find");
    expect(result.actions[0].name).toBe("generateNewKey");
    expect(result.actions[0].params.friendlyName).toBe("The best app");
  });

  test("getAPIKeyAndSecretFromEnvStatus is valid when key exists", async () => {
    // Arrange
    const APP_NAME = "The best app";
    const API_KEY = "SK123";
    const API_SECRET = "shhh";
    const context = createContext({ APP_NAME, API_KEY, API_SECRET });
    mockKeys.fetch.mockReturnValue(
      Promise.resolve({
        sid: API_KEY,
        friendlyName: APP_NAME,
      })
    );

    // Act
    const result = await statusFunctions.getAPIKeyAndSecretFromEnvStatus(context);

    //Assert
    expect(mockKeys.fetch).toHaveBeenCalled();
    expect(result).toBeDefined();
    expect(result.valid).toBeTruthy();
    // In the link
    expect(result.description).toContain(API_KEY);
    // Link description
    expect(result.description).toContain("The best app");
  });

  test("getIncomingNumberStatus offers to purchase if none are found", async () => {
    // Arrange
    mockTwilioClient.incomingPhoneNumbers.list.mockReturnValueOnce(
      Promise.resolve([])
    );

    const context = createContext();

    // Act
    const status = await statusFunctions.getIncomingNumberStatus(context);

    // Assert
    expect(status).toBeDefined();
    expect(status.valid).toBeFalsy();
    expect(status.description).toContain("any numbers yet");
    // No actions, purchase and come back
    expect(status.actions.length).toBe(0);
  });

  test("getIncomingNumberStatus offers existing numbers", async () => {
    // Arrange
    const context = createContext();

    // Act
    const status = await statusFunctions.getIncomingNumberStatus(context);

    // Assert
    expect(status).toBeDefined();
    expect(status.valid).toBeFalsy();
    expect(status.description).toContain("choose an incoming number");
    // The numbers that are owned produce options
    expect(status.actions.length).toBe(fixtureIncomingNumbers.length);
  });

  test("getIncomingNumberStatus offers available numbers it is set to a number not owned", async () => {
    // Arrange
    const INCOMING_NUMBER = '+15550001222';
    const context = createContext({
      INCOMING_NUMBER
    });

    // Act
    const status = await statusFunctions.getIncomingNumberStatus(context);
    
    // Assert
    expect(status).toBeDefined();
    expect(status.valid).toBeFalsy();
    expect(status.description).toContain(`set to ${INCOMING_NUMBER}`);
    // The numbers that are owned produce options
    expect(status.actions.length).toBe(fixtureIncomingNumbers.length);
  });

  test("getIncomingNumberStatus offers to correct itself if it's wired up wrong", async () => {
    // Arrange
    const fixture = [...fixtureIncomingNumbers];
    fixture[0].voiceApplicationSid = "WRONG_APP_SID";
    const INCOMING_NUMBER = fixture[0].phoneNumber;
    const TWIML_APPLICATION_SID = "APP_SID";
    mockTwilioClient.incomingPhoneNumbers.list.mockReturnValueOnce(
      Promise.resolve(fixture)
    );
    const context = createContext({
      INCOMING_NUMBER,
      TWIML_APPLICATION_SID
    });

    // Act
    const status = await statusFunctions.getIncomingNumberStatus(context);
    
    // Assert
    expect(status).toBeDefined();
    expect(status.valid).toBeFalsy();
    expect(status.description).toContain(`incoming number ${fixture[0].friendlyName}`);
    expect(status.description).toContain(`${fixture[0].voiceApplicationSid}`);
    expect(status.description).toContain(TWIML_APPLICATION_SID);
    // Offers to rewire correctly  
    expect(status.actions[0].name).toBe("updateIncomingNumber");
    expect(status.actions[0].params.voiceApplicationSid).toBe(TWIML_APPLICATION_SID);
  });

  test("getIncomingNumberStatus offers ability to change number even when successful", async () => {
    // Arrange
    const fixture = [...fixtureIncomingNumbers];
    fixture[0].voiceApplicationSid = "APP_SID";
    const INCOMING_NUMBER = fixture[0].phoneNumber;
    const TWIML_APPLICATION_SID = "APP_SID";
    const DEFAULT_CLIENT_NAME = "bob";
    mockTwilioClient.incomingPhoneNumbers.list.mockReturnValueOnce(
      Promise.resolve(fixture)
    );
    const context = createContext({
      INCOMING_NUMBER,
      TWIML_APPLICATION_SID,
      DEFAULT_CLIENT_NAME,
    });

    // Act
    const status = await statusFunctions.getIncomingNumberStatus(context);
    
    // Assert
    expect(status).toBeDefined();
    expect(status.valid).toBeTruthy();
    expect(status.description).toContain(`incoming number ${fixture[0].friendlyName}`);
    expect(status.description).toContain(DEFAULT_CLIENT_NAME);
    // Offers to clear number
    expect(status.actions.length).toBe(1);
    expect(status.actions[0].name).toBe("clearIncomingNumber");
  });


  test("getCallerIdStatus suggests incoming numbers and verified ones if CALLER_ID not set", async () => {
    // Act
    const status = await statusFunctions.getCallerIdStatus(createContext());

    // Assert
    expect(status).toBeDefined();
    expect(status.valid).toBeFalsy();
    expect(status.description).toContain("outgoing caller ID can be set");
    // Choose from the available incoming phone numbers and outgoing caller ids
    expect(status.actions.length).toBe(3);
  });

  test("getCallerIdStatus verifies that the supplied number is either a Twilio # or a Verified number", async () => {
    //Arrange
    const CALLER_ID = "+13334445555";
    const context = createContext({ CALLER_ID });

    // Act
    const status = await statusFunctions.getCallerIdStatus(context);

    // Assert
    expect(status).toBeDefined();
    expect(status.valid).toBeFalsy();
    expect(status.description).toContain("not yet verified");
  });

  test("getCallerIdStatus matches a verified number", async () => {
    // Arrange
    // Mocked in outgoingCallerIds.list
    const CALLER_ID = "+18001234567";
    const context = createContext({ CALLER_ID });

    //Act
    const status = await statusFunctions.getCallerIdStatus(context);

    // Assert
    expect(status).toBeDefined();
    expect(status.valid).toBeTruthy();
    expect(status.description).toContain(context.CALLER_ID);
  });

  test("getTwiMLApplicationIsWiredUp is invalid when TwiML Application is missing", async () => {
    // Arrange
    const TWIML_APPLICATION_SID = "AP_NOT_FOUND_EVER";
    mockApplications.fetch.mockImplementationOnce(() => {
      throw new Error("Not found");
    });

    // Act
    const status = await statusFunctions.getTwiMLApplicationIsWiredUp(
      createContext({ TWIML_APPLICATION_SID })
    );

    // Assert
    expect(status).toBeDefined();
    expect(status.valid).toBeFalsy();
    expect(status.description).toContain("couldn't find your specified");
  });

  test("getTwiMLApplicationIsWiredUp is invalid when TwiML Application isn't yet set", async () => {
    // Act
    const status = await statusFunctions.getTwiMLApplicationIsWiredUp(
      createContext()
    );

    // Assert
    expect(status).toBeDefined();
    expect(status.valid).toBeFalsy();
    expect(status.description).toContain("you update your environment");
  });

  test("getTwiMLApplicationIsWiredUp is invalid when voiceUrl doesn't match", async () => {
    // Arrange
    const TWIML_APPLICATION_SID = "AP123";
    const context = createContext({ TWIML_APPLICATION_SID });
    const expectedUrl = `https://${context.DOMAIN_NAME}/client-voice-twiml-app`;
    const intentionallyWrongUrl = "https://spacejam.com/twiml";
    mockApplications.fetch.mockReturnValueOnce(
      Promise.resolve({
        sid: TWIML_APPLICATION_SID,
        voiceUrl: intentionallyWrongUrl,
      })
    );

    // Act
    const status = await statusFunctions.getTwiMLApplicationIsWiredUp(context);

    // Assert
    expect(status).toBeDefined();
    expect(status.valid).toBeFalsy();
    // In display
    expect(status.description).toContain(intentionallyWrongUrl);
    expect(status.description).toContain(expectedUrl);
    expect(status.actions[0].name).toBe("updateTwimlAppVoiceUrl");
    expect(status.actions[0].params.twimlApplicationSid).toBe(
      context.TWIML_APPLICATION_SID
    );
    expect(status.actions[0].params.voiceUrl).toBe(expectedUrl);
  });

  test("getTwiMLApplicationIsWiredUp is valid when voiceUrl matches", async () => {
    // Arrange
    const TWIML_APPLICATION_SID = "AP123";
    const context = createContext({ TWIML_APPLICATION_SID });
    const expectedUrl = `https://${context.DOMAIN_NAME}/client-voice-twiml-app`;
    mockApplications.fetch.mockReturnValueOnce(
      Promise.resolve({
        sid: TWIML_APPLICATION_SID,
        voiceUrl: expectedUrl,
      })
    );

    // Act
    const status = await statusFunctions.getTwiMLApplicationIsWiredUp(context);

    // Assert
    expect(status).toBeDefined();
    expect(status.valid).toBeTruthy();
    // In display
    expect(status.description).toContain(expectedUrl);
  });

  test("getDefaultPasswordChanged is invalid if the default is used", async () => {
    // Arrange
    const ADMIN_PASSWORD = "default";
    const context = createContext({ADMIN_PASSWORD});

    // Act
    const status = await statusFunctions.getDefaultPasswordChanged(context);

    // Assert
    expect(status).toBeDefined();
    expect(status.valid).toBeFalsy();
    expect(status.description).toContain("`.env`");
  });

  test("getDefaultPasswordChanged is valid with different password", async () => {
    // Arrange
    const ADMIN_PASSWORD = "ch@ng3d";
    const context = createContext({ ADMIN_PASSWORD });

    // Act
    const status = await statusFunctions.getDefaultPasswordChanged(context);

    // Assert
    expect(status).toBeDefined();
    expect(status.valid).toBeTruthy();
    expect(status.description).toContain("all set");
  });
});
