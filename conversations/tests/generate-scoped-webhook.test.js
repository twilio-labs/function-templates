const helpers = require("../../test/test-helper");
const generateScopedWebhook = require("../functions/generate-scoped-webhook")
  .handler;
const Twilio = require("twilio");

const StudioFlowSid = "FLxxxxxxxxx";
const WebhookSid = "WHxxxxxxxxx";
const ConversationSid = "CHxxxxxxxxx";
const event = {
  ConversationSid
};

const mockConversationsService = {
  conversations: {
    create: jest.fn(() => {
      sid: ConversationSid;
    })
  },
  webhooks: {
    create: jest.fn(() => {
      return Promise.resolve({
        sid: WebhookSid
      });
    })
  }
};

const mockTwilioClient = {
  conversations: {
    conversations: jest.fn(ConversationSid => mockConversationsService)
  }
};

const context = {
  STUDIO_FLOW_SID: StudioFlowSid,
  getTwilioClient: () => mockTwilioClient
};

beforeAll(() => {
  helpers.setup(context);
});

afterAll(() => {
  helpers.teardown();
});

test("returns success response", done => {
  const callback = (err, result) => {
    console.log(err, result);
    expect(result).toEqual(`webhook ${WebhookSid} successfully created`);
    done();
  };

  generateScopedWebhook(context, event, callback);
});

// test("says Hello World", done => {
//   const callback = (err, result) => {
//     expect(result.toString()).toMatch("<Message>Hello World</Message>");
//     done();
//   };

//   helloVoice(context, event, callback);
// });
