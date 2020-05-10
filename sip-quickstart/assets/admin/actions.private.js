const assets = Runtime.getAssets();
const { urlForSiblingPage } = require(assets["/admin/shared.js"].path);


function sipDomainNameFromDomainName(domainName) {
  // TODO: Should this check availability?
  return domainName;
}

class Actions {
  constructor(client, options) {
    this.client = client;
    this.options = options;
  }

  async initialize() {
    let env = {};
    console.log("Creating SIP Domain");
    const friendlyName = this.options.friendlyName;
    const sipDomainName = sipDomainNameFromDomainName(options.DOMAIN_NAME);
    let results = await this.createSipDomain({ friendlyName, sipDomainName });
    env = Object.assign(env, results);
    const voiceUrl = `https://${this.options.DOMAIN_NAME}${urlForSiblingPage(
      "outbound-calls",
      this.options.PATH,
      ".."
    )}`;
    console.log(
      `Wiring up SIP Domain ${env.SIP_DOMAIN_SID} to the function: ${voiceUrl}`
    );
    await this.updateSipDomainVoiceUrl({
      sipDomainSid: env.SIP_DOMAIN_SID,
      voiceUrl,
    });
    //Create and map credential list to the domain
    results = this.createDefaultCredentialListForDomain({ friendlyName: `${friendlyName} Demo Credentials`, sipDomainSid: env.SIP_DOMAIN_SID });
    env = Object.assign(env, results);
    // Add default credentials
    await this.addDefaultCredentials({credentialListSid: env.CREDENTIAL_LIST_SID});
    const number = await this.chooseLogicalCallerId();
    results = await this.setCallerId({ number });
    env = Object.assign(env, results);
    env.INITIALIZED = "sip-quickstart";
    env.INITIALIZATION_DATE = new Date().toISOString();
    return env;
  }

  async createSipDomain({ friendlyName, domainName }) {
    // TODO: Should this check that it was created successfully
    const result = await this.client.sip.domains.create({
      friendlyName,
      domainName,
    });
    return {
      SIP_DOMAIN_SID: result.sid,
    };
  }

  async createMappedCredentialList({ friendlyName, sipDomainSid }) {
    const credentialList = await this.client.sip.credentialList({
      friendlyName,
    });
    const mapping = await this.client.sip
      .domains(sipDomainSid)
      .auth.calls.credentialListMappings.create({
        credentialListSid: credentialList.sid,
      });
    return {
      CREDENTIAL_LIST_SID: credentialList.sid,
    };
  }

  async createDefaultCredentialListForDomain({ sipDomainSid }) {
    const friendlyName = `${this.options.friendlyName} Demo Credentials`;
    const results = this.createDefaultCredentialListForDomain({friendlyName, sipDomainSid});
    await this.addDefaultCredentials({ credentialListSid: results.CREDENTIAL_LIST_SID });
    return results;
  }

  async addDefaultCredentials({ credentialListSid }) {
    const usernames = ["alice", "bob", "charlie"];
    const password = "ThisIs1Password!";
    const promises = usernames.map((username) =>
      this.addNewCredential({
        credentialListSid,
        username,
        password,
      })
    );
    await Promise.all(promises);
  }

  async addNewCredential({ credentialListSid, username, password }) {
    await this.client
      .credentialLists(credentialListSid)
      .credentials.create({ username, password });
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
