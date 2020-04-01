const helpers = require("../../test/test-helper");
const generateScopedWebhook = require("../functions/generate-scoped-webhook")
  .handler;
const Twilio = require("twilio");

const StudioFlowSid = "FLxxxxxxxxx";
const WebhookSid = "WHxxxxxxxxx";
const ConversationSid = "CHxxxxxxxxx";

const getMockTwilioClient = function(createWebhook) {
  const createConversationsService = ConversationSid => {
    sid: conversationSid;
  };

  const mockConversationsService = {
    conversations: {
      create: createConversationsService
    },
    webhooks: {
      create: createWebhook
    }
  };
  return {
    conversations: {
      conversations: ConversationSid => mockConversationsService
    }
  };
};

const event = {
  ConversationSid
};

afterAll(() => {
  helpers.teardown();
});

test("returns success response", done => {
  const createWebhook = jest.fn(() => Promise.resolve({ sid: WebhookSid }));
  const context = {
    STUDIO_FLOW_SID: StudioFlowSid,
    getTwilioClient: () => getMockTwilioClient(createWebhook)
  };

  const callback = (err, result) => {
    expect(result).toEqual(`webhook ${WebhookSid} successfully created`);
    expect(createWebhook.mock.calls.length).toBe(1);
    expect(createWebhook.mock.calls[0][0]).toStrictEqual({
      "configuration.flowSid": StudioFlowSid,
      "configuration.replayAfter": 0,
      target: "studio"
    });
    done();
  };
  generateScopedWebhook(context, event, callback);
});

test("returns error response", done => {
  const createWebhook = () => Promise.reject("nope");
  const context = {
    STUDIO_FLOW_SID: StudioFlowSid,
    getTwilioClient: () => getMockTwilioClient(createWebhook)
  };

  helpers.setup(context);

  const callback = err => {
    expect(err).toEqual("nope");
    done();
  };

  generateScopedWebhook(context, event, callback);
});
