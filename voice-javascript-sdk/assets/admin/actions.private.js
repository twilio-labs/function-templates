const assets = Runtime.getAssets();
const { urlForSiblingPage } = require(assets['/admin/shared.js'].path);

class Actions {
  constructor(client, options) {
    this.client = client;
    this.options = options;
  }

  async initialize() {
    let env = {};
    console.log('Creating TwiML Application');
    let results = await this.createTwimlApp(this.options);
    env = Object.assign(env, results);
    const voiceUrl = `https://${this.options.DOMAIN_NAME}${urlForSiblingPage(
      'voice-javascript-sdk-twiml-app',
      this.options.PATH,
      '..'
    )}`;
    console.log(
      `Wiring up TwiML Application ${env.TWIML_APPLICATION_SID} to the function: ${voiceUrl}`
    );
    await this.updateTwimlAppVoiceUrl({
      twimlApplicationSid: env.TWIML_APPLICATION_SID,
      voiceUrl,
    });
    console.log('Generating new REST API Key');
    results = await this.generateNewKey(this.options);
    env = Object.assign(env, results);
    const number = await this.chooseLogicalCallerId();
    results = await this.setCallerId({ number });
    env = Object.assign(env, results);
    env.INITIALIZED = 'voice-javascript-sdk-quickstart';
    env.INITIALIZATION_DATE = new Date().toISOString();
    return env;
  }

  async createTwimlApp({ friendlyName }) {
    const result = await this.client.applications.create({ friendlyName });
    return {
      TWIML_APPLICATION_SID: result.sid,
    };
  }

  async updateTwimlAppVoiceUrl({ twimlApplicationSid, voiceUrl }) {
    const app = await this.client
      .applications(twimlApplicationSid)
      .update({ voiceUrl });
  }

  async generateNewKey({ friendlyName }) {
    const result = await this.client.newKeys.create({ friendlyName });
    return {
      API_KEY: result.sid,
      API_SECRET: result.secret,
    };
  }

  async chooseLogicalCallerId() {
    const incomingNumbers = await this.client.incomingPhoneNumbers.list({
      limit: 1,
    });
    let number;
    if (incomingNumbers.length > 0) {
      number = incomingNumbers[0].phoneNumber;
    } else {
      const outgoingCallerIds = await this.client.outgoingCallerIds.list({
        limit: 1,
      });
      // Required right?
      number = outgoingCallerIds[0].phoneNumber;
    }
    return number;
  }

  async setCallerId({ number }) {
    return {
      CALLER_ID: number,
    };
  }

  async useExistingTwimlApp({ twimlApplicationSid }) {
    return {
      TWIML_APPLICATION_SID: twimlApplicationSid,
    };
  }
}

module.exports = Actions;
