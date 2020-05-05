const assets = Runtime.getAssets();
const { urlForSiblingPage } = require(assets["/admin/shared.js"].path);

class Actions {
  constructor(client, options) {
    this.client = client;
    this.options = options;
  }

  async initialize() {
    let env = {};
    console.log("Creating SIP Domain");
    let results = await this.createSipDomain(this.options);
    env = Object.assign(env, results);
    const voiceUrl = `https://${this.options.DOMAIN_NAME}${urlForSiblingPage(
      "outbound-calls",
      this.options.PATH,
      ".."
    )}`;
    console.log(
      `Wiring up TwiML Application ${env.SIP_DOMAIN_SID} to the function: ${voiceUrl}`
    );
    await this.updateTwimlAppVoiceUrl({
      sipDomainSid: env.SIP_DOMAIN_SID,
      voiceUrl,
    });
    env = Object.assign(env, results);
    const number = await this.chooseLogicalCallerId();
    results = await this.setCallerId({ number });
    env = Object.assign(env, results);
    env.INITIALIZED = "sip-quickstart";
    env.INITIALIZATION_DATE = new Date().toISOString();
    return env;
  }

  async createSipDomain({ friendlyName, domainName }) {
    // TODO: Should this check that it was created successfully
    // TODO: Do all the credential stuff here?
    const result = await this.client.sip.domains.create({
      friendlyName,
      domainName,
    });
    return {
      SIP_DOMAIN_SID: result.sid,
    };
  }

  async updateSipDomainVoiceUrl({ sipDomainSid, voiceUrl }) {
    await this.client.sip.domains(sipDomainSid).update({ voiceUrl });
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

  async useExistingSipDomain({ sipDomainSid }) {
    return {
      SIP_DOMAIN_SID: sipDomainSid,
    };
  }
}

module.exports = Actions;
