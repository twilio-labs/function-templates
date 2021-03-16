const assets = Runtime.getAssets();
const { urlForSiblingPage } = require(assets["/admin/shared.js"].path);

const DEFAULT_TWILIO_WEBHOOK = "https://demo.twilio.com/welcome/voice/";

class Actions {
  constructor(client, options) {
    this.client = client;
    this.options = options;
  }

  async initialize() {
    let env = {};
    console.log("Creating TwiML Application");
    let results = await this.createTwimlApp(this.options);
    env = Object.assign(env, results);
    const voiceUrl = `https://${this.options.DOMAIN_NAME}${urlForSiblingPage(
      "client-voice-twiml-app",
      this.options.PATH,
      ".."
    )}`;
    console.log(
      `Wiring up TwiML Application ${env.TWIML_APPLICATION_SID} to the function: ${voiceUrl}`
    );
    await this.updateTwimlAppVoiceUrl({
      twimlApplicationSid: env.TWIML_APPLICATION_SID,
      voiceUrl,
    });
    console.log("Generating new REST API Key");
    results = await this.generateNewKey(this.options);
    env = Object.assign(env, results);
    const incomingNumber = await this.chooseLogicalIncomingNumber(options.CHOSEN_TWILIO_NUMBER);
    if (incomingNumber !== undefined) {
      results = await this.updateIncomingNumber({
        sid: incomingNumber.sid,
        voiceApplicationSid: env.TWIML_APPLICATION_SID,
      });
      env = Object.assign(env, results);
      results = await this.setCallerId({ number: incomingNumber.phoneNumber });
      env = Object.assign(env, results);
    } else {
      // Did not find an incoming number, so we'll just choose a number
      const callerIdNumber = await this.chooseLogicalCallerId();
      results = await this.setCallerId({ number: callerIdNumber });
      env = Object.assign(env, results);
    }
    env.INITIALIZED = "voice-client-quickstart";
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

  async chooseLogicalIncomingNumber(preferredNumber) {
    const incomingNumbers = await this.client.incomingPhoneNumbers.list();
    if (preferredNumber !== undefined) {
      return incomingNumbers.find(number => number.phoneNumber === preferredNumber);
    }
    return incomingNumbers.find(
      (number) =>
        number.voiceUrl === DEFAULT_TWILIO_WEBHOOK || number.voiceUrl === ""
    );
  }

  async chooseLogicalCallerId() {
    // This is only needed if we don't get a logical incoming number
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

  async clearCallerId() {
    return {
      CALLER_ID: undefined,
    };
  }

  async updateIncomingNumber({ sid, voiceApplicationSid }) {
    const incomingNumber = await this.client.incomingPhoneNumbers(sid).update({
      voiceApplicationSid,
    });
    return {
      INCOMING_NUMBER: incomingNumber.phoneNumber,
    };
  }

  async clearIncomingNumber() {
    return {
      INCOMING_NUMBER: undefined,
    };
  }

  async useExistingTwimlApp({ twimlApplicationSid }) {
    return {
      TWIML_APPLICATION_SID: twimlApplicationSid,
    };
  }
}

module.exports = Actions;
