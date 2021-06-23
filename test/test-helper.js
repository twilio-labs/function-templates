const fs = require('fs');
const path = require('path');
const Twilio = require('twilio');

class MockRuntime {
  constructor(context) {
    this.context = context;
    this._assets = {};
    this._functions = {};
  }

  _addAsset(key, filePath) {
    const resolved = path.resolve(
      path.dirname(module.parent.filename),
      filePath
    );
    this._assets[key] = {
      path: resolved,
      open: () => fs.readFileSync(resolved),
    };
  }

  _addFunction(key, filePath) {
    this._functions[key] = {
      path: path.resolve(filePath),
    };
  }

  getAssets() {
    if (Object.keys(this._assets).length === 0) {
      throw new Error('You must explicitly add assets using MockRuntime');
    }
    return this._assets;
  }

  getFunctions() {
    if (Object.keys(this._functions).length === 0) {
      throw new Error('You must explicitly add functions using MockRuntime');
    }
    return this._functions;
  }
}

class Response {
  constructor() {
    this._body = {};
    this._headers = {};
    this._statusCode = 200;
  }

  setBody(body) {
    this._body = body;
  }

  setStatusCode(code) {
    this._statusCode = code;
  }

  appendHeader(key, value) {
    this._headers[key] = value;
  }
}

const setup = (context = {}, runtime = new MockRuntime()) => {
  global.Twilio = Twilio;
  global.Twilio.Response = Response;
  if (context.ACCOUNT_SID && context.AUTH_TOKEN) {
    global.twilioClient = new Twilio(context.ACCOUNT_SID, context.AUTH_TOKEN);
  }
  global.Runtime = runtime;
};

const teardown = () => {
  delete global.Twilio;
  if (global.twilioClient) delete global.twilioClient;
  if (global.Runtime) delete global.Runtime;
};

const backupEnv = () => {
  return { ...process.env };
};

const restoreEnv = (backupEnv) => {
  if (backupEnv === undefined) {
    return;
  }
  for (const key of Object.keys(process.env)) {
    if (backupEnv[key] === undefined) {
      delete process.env[key];
    }
  }
  for (const key of Object.keys(backupEnv)) {
    process.env[key] = backupEnv[key];
  }
};

module.exports = {
  setup,
  teardown,
  MockRuntime,
  backupEnv,
  restoreEnv,
};
