const Twilio = require("twilio");
const { fsHelpers } = require("@twilio-labs/serverless-api");

// Heavily lifted from Twilio Run
// Added instance cache, for test purposes
class RuntimeInstance {
  constructor(context) {
    this.context = context;
    this.loaded = false;
    this.allRoutes = new Map();
    this.assetsCache = new Set();
    this.functionsCache = new Set();
  }

  _setRoutes({ functions, assets }) {
    this.allRoutes.clear();
    this.assetsCache.clear();
    this.functionsCache.clear();

    functions.forEach(fn => {
      if (!fn.path) {
        return;
      }
  
      if (this.allRoutes.has(fn.path)) {
        throw new Error(`Duplicate. Path ${fn.path} already exists`);
      }
      this.functionsCache.add(fn);
      this.allRoutes.set(fn.path, {
        ...fn,
        type: 'function',
      });
    });
  
    assets.forEach(asset => {
      if (!asset.path) {
        return;
      }
  
      if (this.allRoutes.has(asset.path)) {
        throw new Error(`Duplicate. Path ${asset.path} already exists`);
      }
      this.assetsCache.add(asset);
      this.allRoutes.set(asset.path, {
        ...asset,
        type: 'asset',
      });
    });

    return new Map(this.allRoutes);
  }
   _getCachedResources() {
    return {
      assets: Array.from(this.assetsCache),
      functions: Array.from(this.functionsCache),
    };
  }

  async load() {
    const { functions, assets } = await fsHelpers.getListOfFunctionsAndAssets(
      this.context.baseDir
    );
    this._setRoutes({ functions, assets });
  }

  getAssets() {
    const { assets } = this._getCachedResources();
    const result = {};
    assets.forEach(asset => {
      if (asset.access === 'private') {
        const open = () => readFileSync(asset.filePath, 'utf8');
        result[asset.path] = { path: asset.filePath, open };
      }
    });
    return result;

  }

  getFunctions() {
    const { functions } = getCachedResources();
    if (functions.length === 0) {
      return {};
    }
    const result = {};
    for (const fn of functions) {
      result[fn.path.substr(1)] = { path: fn.filePath };
    }
    return result;
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

const setup = (context = {}) => {
  global.Twilio = Twilio;
  global.Twilio.Response = Response;
  if (context.ACCOUNT_SID && context.AUTH_TOKEN) {
    global.twilioClient = new Twilio(context.ACCOUNT_SID, context.AUTH_TOKEN);
  }
  global.Runtime = new RuntimeInstance(context);
};

const teardown = () => {
  delete global.Twilio;
  if (global.twilioClient) delete global.twilioClient;
  if (global.Runtime) delete global.Runtime;
};

module.exports = {
  setup: setup,
  teardown: teardown,
};
