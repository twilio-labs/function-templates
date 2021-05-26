const helpers = require("../../../../test/test-helper");

let actions;

const DEFAULT_TWILIO_WEBHOOK = "https://demo.twilio.com/welcome/voice/";

const mockTwilioClient = {};
const mockApplicationsUpdate = jest.fn();
const mockIncomingNumbersUpdate = jest.fn();

mockTwilioClient.applications = jest.fn(() => {
  return { update: mockApplicationsUpdate };
});
mockTwilioClient.applications.create = jest.fn(() =>
  Promise.resolve({ sid: "AP123" })
);
mockTwilioClient.newKeys = {
  create: jest.fn(() => {
    return {
      sid: "SK123",
      secret: "shhh",
    };
  }),
};
mockTwilioClient.incomingPhoneNumbers = jest.fn(() => {
  return { update: mockIncomingNumbersUpdate };
});
mockTwilioClient.incomingPhoneNumbers.list = jest.fn()

mockTwilioClient.outgoingCallerIds = {
  list: jest.fn(),
};

describe("voice-client-javascript/admin/private/actions", () => {
  beforeAll(() => {
    const runtime = new helpers.MockRuntime();
    runtime._addAsset(
      "/admin/shared.js",
      "../../../assets/admin/shared.private.js"
    );
    helpers.setup({}, runtime);
    const Actions = require("../../../assets/admin/actions.private.js");
    options = {
      friendlyName: "Example App",
      DOMAIN_NAME: "blargh-duck-123.com",
      PATH: "/admin/perform-action",
    };
    actions = new Actions(mockTwilioClient, options);
  });
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("createTwimlApp creates and returns a TwiML App", async () => {
    // Act
    const result = await actions.createTwimlApp({
      friendlyName: "Example App",
    });

    // Assert
    expect(mockTwilioClient.applications.create).toHaveBeenCalledWith({
      friendlyName: "Example App",
    });
    expect(result).toBeDefined();
    expect(result.TWIML_APPLICATION_SID).toBe("AP123");
  });

  test("updateTwimlAppVoiceUrl updates TwiML App", async () => {
    // Act
    await actions.updateTwimlAppVoiceUrl({
      twimlApplicationSid: "AP123",
      voiceUrl: "https://spacejam.com/twiml",
    });

    // Assert
    expect(mockTwilioClient.applications).toHaveBeenCalledWith("AP123");
    expect(mockApplicationsUpdate).toHaveBeenCalledWith({
      voiceUrl: "https://spacejam.com/twiml",
    });
  });

  test("generateNewKey makes a new REST API Key", async () => {
    // Act
    const result = await actions.generateNewKey({ friendlyName: "Test Key" });

    // Assert
    expect(result).toBeDefined();
    expect(result.API_KEY).toBe("SK123");
    expect(result.API_SECRET).toBe("shhh");
    expect(mockTwilioClient.newKeys.create).toHaveBeenCalledWith({
      friendlyName: "Test Key",
    });
  });

  test("setCallerId passes thru appropriate environment variable", async () => {
    const results = await actions.setCallerId({ number: "+1555123456" });
    expect(results.CALLER_ID).toBe("+1555123456");
  });

  test("useExistingTwimlApp passes thru appropriate environment variables", async () => {
    const results = await actions.useExistingTwimlApp({
      twimlApplicationSid: "AP456",
    });
    expect(results.TWIML_APPLICATION_SID).toBe("AP456");
  });

  test("chooseLogicalIncomingNumber chooses the first incoming number that has the default voice webhook url", async () => {
    // Arrange
    mockTwilioClient.incomingPhoneNumbers.list.mockReturnValue([
      {
        sid: "PN123",
        phoneNumber: "+15551112222",
        voiceUrl: "https://not-this-one.com/twiml",
      },
      {
        sid: "PN456",
        phoneNumber: "+15552223333",
        voiceUrl: DEFAULT_TWILIO_WEBHOOK,
      },
    ]);

    // Act
    const result = await actions.chooseLogicalIncomingNumber();

    // Assert
    expect(result.phoneNumber).toBe("+15552223333");
    expect(mockTwilioClient.incomingPhoneNumbers.list).toHaveBeenCalled();
  });

  test("chooseLogicalIncomingNumber chooses the first incoming number that has the no voice webhook url set", async () => {
    // Arrange
    mockTwilioClient.incomingPhoneNumbers.list.mockReturnValue([
      {
        sid: "PN123",
        phoneNumber: "+15551112222",
        voiceUrl: "https://not-this-one.com/twiml",
      },
      { sid: "PN456", phoneNumber: "+15552223333", voiceUrl: "" },
    ]);

    // Act
    const result = await actions.chooseLogicalIncomingNumber();

    // Assert
    expect(result.phoneNumber).toBe("+15552223333");
    expect(mockTwilioClient.incomingPhoneNumbers.list).toHaveBeenCalled();
  });

  test("chooseLogicalIncomingNumber will not return a set --voice-url", async () => {
    // Arrange
    mockTwilioClient.incomingPhoneNumbers.list.mockReturnValue([
      {
        sid: "PN123",
        phoneNumber: "+15551112222",
        voiceUrl: "https://not-this-one.com/twiml",
      },
      {
        sid: "PN456",
        phoneNumber: "+15552223333",
        voiceUrl: "https://or-this-one.com/twiml",
      },
    ]);

    // Act
    const result = await actions.chooseLogicalIncomingNumber();

    // Assert
    expect(result).toBeUndefined();
    expect(mockTwilioClient.incomingPhoneNumbers.list).toHaveBeenCalled();
  });

  test("chooseLogicalCallerId chooses incoming the first incoming number that exists", async () => {
    // Arrange
    mockTwilioClient.incomingPhoneNumbers.list.mockReturnValue([
      { sid: "PN123", phoneNumber: "+15557654321" },
    ]);

    // Act
    const result = await actions.chooseLogicalCallerId();

    // Assert
    expect(result).toBe("+15557654321");
    expect(mockTwilioClient.incomingPhoneNumbers.list).toHaveBeenCalled();
  });

  test("chooseLogicalCallerId chooses verified number if there are no incoming phone numbers", async () => {
    // Arrange
    mockTwilioClient.incomingPhoneNumbers.list.mockReturnValue([]);
    mockTwilioClient.outgoingCallerIds.list.mockReturnValue([
      { phoneNumber: "+15553336666" },
    ]);

    // Act
    const result = await actions.chooseLogicalCallerId();

    // Assert
    expect(result).toBe("+15553336666");
    expect(mockTwilioClient.incomingPhoneNumbers.list).toHaveBeenCalled();
    expect(mockTwilioClient.outgoingCallerIds.list).toHaveBeenCalled();
  });

  test("clearCallerId returns object that would update environment properly", async () => { 
    // Act
    const results = await actions.clearCallerId();

    // Assert
    expect(Object.keys(results)).toContain("CALLER_ID");
    expect(results.CALLER_ID).toBe(undefined);
  });

  test("clearIncomingNumber returns object that would update environment properly", async () => { 
    // Act
    const results = await actions.clearIncomingNumber();

    // Assert
    expect(Object.keys(results)).toContain("INCOMING_NUMBER");
    expect(results.CALLER_ID).toBe(undefined);
  });


  test("initialize will setup all the things from options", async () => {
    // Arrange
    const mockLogicalIncomingNumber = {
      sid: "PN123",
      phoneNumber: "+15551213434",
      voiceUrl: DEFAULT_TWILIO_WEBHOOK,
    };

    mockTwilioClient.incomingPhoneNumbers.list.mockReturnValueOnce([
      {
        sid: "PN001",
        phoneNumber: "+15551000000",
        voiceUrl: "https://twimllionaire.com/twiml",
      },
      mockLogicalIncomingNumber
    ]);
    mockIncomingNumbersUpdate.mockReturnValueOnce(Promise.resolve(mockLogicalIncomingNumber));

    // Act
    // options are passed into the constructor
    const results = await actions.initialize();

    // Assert
    expect(results).toBeDefined();
    // These actions are specific to this codebase (cannot be overridden)
    expect(results.INITIALIZED).toBe("voice-client-quickstart");
    expect(results.INITIALIZATION_DATE).toBeDefined();
    expect(results.TWIML_APPLICATION_SID).toBe("AP123");
    // Updates the new TwiML App with the function
    expect(mockTwilioClient.applications).toHaveBeenCalledWith("AP123");
    expect(mockApplicationsUpdate).toHaveBeenCalledWith({
      voiceUrl: "https://blargh-duck-123.com/client-voice-twiml-app",
    });
    // API Key is created with the friendly name
    expect(results.API_KEY).toBe("SK123");
    expect(results.API_SECRET).toBe("shhh");
    expect(mockTwilioClient.newKeys.create).toHaveBeenCalledWith({
      friendlyName: "Example App",
    });
    // Incoming number updates as expected
    expect(mockTwilioClient.incomingPhoneNumbers).toHaveBeenCalledWith(mockLogicalIncomingNumber.sid);
    expect(mockIncomingNumbersUpdate).toHaveBeenCalledWith({
      voiceApplicationSid: "AP123",
    });
    expect(results.INCOMING_NUMBER).toBe("+15551213434");
    // Caller ID is set based on incoming number
    expect(results.CALLER_ID).toBe("+15551213434");
  });

  test("initialize will choose a outgoingCallerId if it is missing", async () => {
    // Arrange
    mockTwilioClient.outgoingCallerIds.list.mockReturnValue([
      { phoneNumber: "+15553336666" },
    ]);

    // Act
    // options are passed into the constructor
    const results = await actions.initialize();

    // Assert
    expect(results).toBeDefined();
    expect(mockTwilioClient.incomingPhoneNumbers.list).toHaveBeenCalled();
    expect(results.CALLER_ID).toBe("+15553336666");
  });

});
