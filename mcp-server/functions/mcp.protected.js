/* eslint-disable callback-return */

const { randomUUID } = require('crypto');

const modules = Runtime.getFunctions();
const createServer = require(modules.server.path);
const createReq = require(modules.req.path);
const createRes = require(modules.res.path);

const defaultMessaging = [
  'Api20100401Message',
  'Api20100401IncomingPhoneNumber',
];

const TWILIO_TAG_MAP = {
  Messaging: defaultMessaging,
  Voice: ['Api20100401Call'],
  VoiceAddOns: [
    'Api20100401Recording',
    'Api20100401Transcription',
    'Api20100401Conference',
  ],
  Conversations: [
    'ConversationsV1Conversation',
    'ConversationsV1Message',
    'ConversationsV1Participant',
    'ConversationsV1Service',
    'ConversationsV1User',
  ],
  Studio: [
    'StudioV2Execution',
    'StudioV2ExecutionContext',
    'StudioV2ExecutionStep',
    'StudioV2Flow',
    'StudioV2FlowRevision',
    'StudioV2FlowValidate',
  ],
  TaskRouter: [
    'TaskrouterV1Activity',
    'TaskrouterV1Event',
    'TaskrouterV1Task',
    'TaskrouterV1TaskChannel',
    'TaskrouterV1TaskQueue',
    'TaskrouterV1TaskReservation',
    'TaskrouterV1Worker',
    'TaskrouterV1WorkerChannel',
    'TaskrouterV1WorkerReservation',
    'TaskrouterV1Workflow',
    'TaskrouterV1Workspace',
    'TaskrouterV1WorkspaceStatistics',
  ],
  Serverless: [
    'ServerlessV1Asset',
    'ServerlessV1AssetVersion',
    'ServerlessV1Build',
    'ServerlessV1Deployment',
    'ServerlessV1Environment',
    'ServerlessV1Function',
    'ServerlessV1Service',
    'ServerlessV1Variable',
  ],
  Account: ['Api20100401Account'],
  PhoneNumbers: ['Api20100401IncomingPhoneNumber', 'Api20100401Address'],
  Applications: ['Api20100401Application'],
  Auth: ['Api20100401Token'],
  AddOns: ['Api20100401AddOnResult'],
  Usage: ['Api20100401Usage'],
};

const validateContext = (context, callback) => {
  if (!context.ACCOUNT_SID || !context.API_KEY || !context.API_SECRET) {
    const response = new Twilio.Response();
    response.setStatusCode(400);
    response.setBody({
      error:
        'required context variables ACCOUNT_SID or API_KEY or API_SECRET not found',
    });

    callback(null, response);

    return false;
  }

  return true;
};

const getTags = (event) => {
  if (!event.services) {
    return defaultMessaging;
  }

  const services =
    typeof event.services === 'string' ? [event.services] : event.services;
  // MCP does not like additoinal keys
  delete event.services;

  const tags = [];
  services.forEach((service) => {
    if (TWILIO_TAG_MAP[service]) {
      tags.push(...TWILIO_TAG_MAP[service]);
    }
  });

  if (tags.length === 0) {
    return ['Api20100401Message'];
  }

  return tags;
};

exports.handler = async function (context, event, callback) {
  const id = randomUUID().substring(0, 6);
  console.log(`[${id}]`, 'STARTED MCP called with method', event.method);
  if (event.method === 'tools/call') {
    console.log(
      `[${id}]`,
      'Calling tool',
      event.params.name,
      'with arguments',
      event.params.arguments
    );
  }

  if (!validateContext(context, callback)) {
    return;
  }

  try {
    const tags = getTags(event);
    const { transport } = await createServer(context, event, tags);
    const req = createReq(event);
    const res = createRes(callback);

    await transport.handleRequest(req, res);
  } catch (error) {
    console.log(`[${id}]`, 'FAILED MCP request with method', event.method);
    console.log(error);

    const response = new Twilio.Response();
    response.setStatusCode(500);
    response.setBody({ error: error.message });
    callback(null, response);
  } finally {
    console.log(`[${id}]`, 'COMPLETED MCP request with method', event.method);
  }
};
