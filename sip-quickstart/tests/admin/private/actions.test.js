const helpers = require("../../../../test/test-helper");

let actions;

const mockTwilioClient = {
  sip: {}
};
const mockSipDomainUpdate = jest.fn();
mockTwilioClient.sip.domains = jest.fn(() => {
  return { update: mockSipDomainUpdate };
});
mockTwilioClient.sip.domains.create = jest.fn(() =>
  Promise.resolve({ sid: "SD123" })
);
mockTwilioClient.incomingPhoneNumbers = {
  list: jest.fn()
};
mockTwilioClient.outgoingCallerIds = {
  list: jest.fn()
};

describe("sip-quickstart/admin/private/actions", () => {
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

  test("createSipDomain creates and returns a SIP Domain SID", async () => {
    // Act
    const result = await actions.createSipDomain({
      friendlyName: "Example Domain",
      domainName: "example-domain",
    });

    // Assert
    // TODO: Defaults
    expect(mockTwilioClient.sip.domains.create).toHaveBeenCalledWith({
      friendlyName: "Example Domain",
      domainName: "example-domain"
    });
    expect(result).toBeDefined();
    expect(result.SIP_DOMAIN_SID).toBe("SD123");
  });

  test("updateSipDomainVoiceUrl updates SIP Domian", async () => {
    // Act
    await actions.updateSipDomainVoiceUrl({
      sipDomainSid: "SD123",
      voiceUrl: "https://spacejam.com/twiml",
    });

    // Assert
    expect(mockTwilioClient.sip.domains).toHaveBeenCalledWith("SD123");
    expect(mockSipDomainUpdate).toHaveBeenCalledWith({
      voiceUrl: "https://spacejam.com/twiml",
    });
  });

  test("setCallerId passes thru appropriate environment variable", async () => {
    const results = await actions.setCallerId({ number: "+1555123456" });
    expect(results.CALLER_ID).toBe("+1555123456");
  });

  test("useExistingSipDomain passes thru appropriate environment variables", async () => {
    const results = await actions.useExistingSipDomain({
      sipDomainSid: "SD456",
    });
    expect(results.SIP_DOMAIN_SID).toBe("SD456");
  });

  test("chooseLogicalCallerId chooses incoming the first incoming number that exists", async () => {
    // Arrange
    mockTwilioClient.incomingPhoneNumbers.list.mockReturnValue([{phoneNumber: "+15557654321"}]);

    // Act
    const result = await actions.chooseLogicalCallerId();

    // Assert
    expect(result).toBe("+15557654321");
    expect(mockTwilioClient.incomingPhoneNumbers.list).toHaveBeenCalled();
  });
  test("chooseLogicalCallerId chooses verified number if there are no incoming phone numbers", async () => {
    // Arrange
    mockTwilioClient.incomingPhoneNumbers.list.mockReturnValue([]);
    mockTwilioClient.outgoingCallerIds.list.mockReturnValue([{phoneNumber: "+15553336666"}]);


    // Act
    const result = await actions.chooseLogicalCallerId();

    // Assert
    expect(result).toBe("+15553336666");
    expect(mockTwilioClient.incomingPhoneNumbers.list).toHaveBeenCalled();
    expect(mockTwilioClient.outgoingCallerIds.list).toHaveBeenCalled();
  });

  test("initialize will setup all the things from options", async () => {
      // Arrange
      mockTwilioClient.incomingPhoneNumbers.list.mockReturnValue([{phoneNumber: "+15551213434"}]);


      // Act
      // options are passed into the constructor
      const results = await actions.initialize();

      // Assert
      expect(results).toBeDefined();
      // These actions are specific to this codebase (cannot be overridden)
      expect(results.INITIALIZED).toBe("sip-quickstart");
      expect(results.INITIALIZATION_DATE).toBeDefined();
      expect(results.SIP_DOMAIN_SID).toBe("SD123");
      // Updates the new TwiML App with the function
      expect(mockTwilioClient.sip.domains).toHaveBeenCalledWith("SD123");
      expect(mockSipDomainUpdate).toHaveBeenCalledWith({
        voiceUrl: "https://blargh-duck-123.com/outbound-calls"
      });
      expect(results.CALLER_ID).toBe("+15551213434");
  });
});
