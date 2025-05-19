/* eslint-disable import/extensions, import/no-unresolved */

const { default: TwilioMcp } = require('@twilio-alpha/mcp/build/server');
const {
  StreamableHTTPServerTransport,
} = require('@modelcontextprotocol/sdk/server/streamableHttp.js');
const { randomUUID } = require('crypto');

const modules = Runtime.getFunctions();
const createReq = require(modules.req.path);
const createRes = require(modules.res.path);

const TAG_TO_FILE_MAP = {
  Api20100401Message: 'twilio_api_v2010',
  Api20100401Call: 'twilio_api_v2010',
  Api20100401Recording: 'twilio_api_v2010',
  Api20100401Transcription: 'twilio_api_v2010',
  Api20100401Conference: 'twilio_api_v2010',

  ConversationsV1Conversation: 'twilio_conversations_v1',
  ConversationsV1Message: 'twilio_conversations_v1',
  ConversationsV1Participant: 'twilio_conversations_v1',
  ConversationsV1Service: 'twilio_conversations_v1',
  ConversationsV1User: 'twilio_conversations_v1',

  StudioV2Execution: 'twilio_studio_v2',
  StudioV2ExecutionContext: 'twilio_studio_v2',
  StudioV2ExecutionStep: 'twilio_studio_v2',
  StudioV2Flow: 'twilio_studio_v2',
  StudioV2FlowRevision: 'twilio_studio_v2',

  TaskrouterV1Activity: 'twilio_taskrouter_v1',
  TaskrouterV1Event: 'twilio_taskrouter_v1',
  TaskrouterV1Task: 'twilio_taskrouter_v1',
  TaskrouterV1TaskChannel: 'twilio_taskrouter_v1',
  TaskrouterV1TaskQueue: 'twilio_taskrouter_v1',
  TaskrouterV1TaskReservation: 'twilio_taskrouter_v1',
  TaskrouterV1Worker: 'twilio_taskrouter_v1',
  TaskrouterV1WorkerChannel: 'twilio_taskrouter_v1',
  TaskrouterV1WorkerReservation: 'twilio_taskrouter_v1',
  TaskrouterV1Workflow: 'twilio_taskrouter_v1',
  TaskrouterV1Workspace: 'twilio_taskrouter_v1',
  TaskrouterV1WorkspaceStatistics: 'twilio_taskrouter_v1',

  ServerlessV1Asset: 'twilio_serverless_v1',
  ServerlessV1AssetVersion: 'twilio_serverless_v1',
  ServerlessV1Build: 'twilio_serverless_v1',
  ServerlessV1Deployment: 'twilio_serverless_v1',
  ServerlessV1Environment: 'twilio_serverless_v1',
  ServerlessV1Function: 'twilio_serverless_v1',
  ServerlessV1Service: 'twilio_serverless_v1',
  ServerlessV1Variable: 'twilio_serverless_v1',

  Api20100401Account: 'twilio_api_v2010',
  Api20100401IncomingPhoneNumber: 'twilio_api_v2010',
  Api20100401Address: 'twilio_api_v2010',
  Api20100401Application: 'twilio_api_v2010',
  Api20100401Token: 'twilio_api_v2010',
  Api20100401AddOnResult: 'twilio_api_v2010',
  Api20100401Usage: 'twilio_api_v2010',
};

/**
 * Creates an MCP server
 * @param {*} context
 * @param {*} event
 * @returns
 */
module.exports = async function createServer(context, event, tags) {
  const services = [
    ...new Set(tags.map((tag) => TAG_TO_FILE_MAP[tag]).filter(Boolean)),
  ];

  const server = new TwilioMcp({
    server: {
      name: 'Twilio MCP Server',
      version: '1.0.0',
    },
    filters: {
      tags,
      services,
    },
    accountSid: context.ACCOUNT_SID,
    credentials: {
      apiKey: context.API_KEY,
      apiSecret: context.API_SECRET,
    },
  });

  const sessionId = randomUUID();
  const transport = new StreamableHTTPServerTransport({
    sessionIdGenerator: () => sessionId,
    onsessioninitialized: (sessionId) => {
      console.log('session initialized', sessionId);
    },
  });
  await server.start(transport);

  // Because this is serverless, we need to re-initialize the server everytime
  if (event.method !== 'initialize') {
    const req = createReq(event, {
      jsonrpc: '2.0',
      id: 0,
      method: 'initialize',
      params: {
        protocolVersion: '2024-11-05',
        capabilities: { sampling: {}, roots: { listChanged: true } },
        clientInfo: { name: 'internal-initialization', version: '0.1.0' },
      },
    });
    req.method = 'POST';

    const promise = new Promise(async (resolve) => {
      delete req.headers['mcp-session-id'];
      const res = createRes((err, data) => {
        if (err) {
          console.error('Error initializing session:', err);
        }
        // now set the mcp session id
        event.request.headers['mcp-session-id'] =
          data.headers['mcp-session-id'];
        resolve();
      });
      await transport.handleRequest(req, res);
    });
    await promise;
  }

  return { server, transport };
};
