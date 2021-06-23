const assets = Runtime.getAssets();
const { urlForSiblingPage } = require(assets['/admin/shared.js'].path);
const extensions = require(assets['/extensions.js'].path);

const DEFAULT_TWILIO_WEBHOOK = 'https://demo.twilio.com/welcome/voice/';

function sipDomainNameFromDomainName(domainName) {
  return domainName.replace('.twil.io', '.sip.twilio.com');
}

class Actions {
  constructor(client, options) {
    this.client = client;
    this.options = options;
  }

  async initialize() {
    let env = {};
    console.log('Creating SIP Domain');
    const { friendlyName } = this.options;
    const sipDomainName = sipDomainNameFromDomainName(this.options.DOMAIN_NAME);
    let results = await this.createSipDomain({
      friendlyName,
      domainName: sipDomainName,
    });
    env = Object.assign(env, results);
    const outboundVoiceUrl = `https://${
      this.options.DOMAIN_NAME
    }${urlForSiblingPage('outbound-calls', this.options.PATH, '..')}`;
    console.log(
      `Wiring up SIP Domain ${env.SIP_DOMAIN_SID} to the function: ${outboundVoiceUrl}`
    );
    await this.updateSipDomainVoiceUrl({
      sipDomainSid: env.SIP_DOMAIN_SID,
      voiceUrl: outboundVoiceUrl,
    });
    // Create and map credential list to the domain
    console.log('Building and wiring up default credential list');
    results = await this.createDefaultCredentialListForDomain({
      sipDomainSid: env.SIP_DOMAIN_SID,
    });
    env = Object.assign(env, results);
    const incomingNumber = await this.chooseLogicalIncomingNumber();
    let outgoingCallerId;
    if (incomingNumber) {
      const incomingVoiceUrl = `https://${
        this.options.DOMAIN_NAME
      }${urlForSiblingPage('extension-menu', this.options.PATH, '..')}`;
      console.log(
        `Wiring up your number ${incomingNumber.phoneNumber} to the function: ${incomingVoiceUrl}`
      );
      results = await this.updateIncomingNumber({
        sid: incomingNumber.sid,
        voiceUrl: incomingVoiceUrl,
      });
      env = Object.assign(env, results);
      outgoingCallerId = incomingNumber.phoneNumber;
    } else {
      outgoingCallerId = await this.chooseLogicalCallerId();
    }
    results = await this.setCallerId({ number: outgoingCallerId });
    env = Object.assign(env, results);
    env.INITIALIZED = 'sip-quickstart';
    env.INITIALIZATION_DATE = new Date().toISOString();
    return env;
  }

  // eslint-disable-next-line consistent-return
  async createSipDomain({ friendlyName, domainName }) {
    try {
      const result = await this.client.sip.domains.create({
        friendlyName,
        domainName,
      });
      return {
        SIP_DOMAIN_SID: result.sid,
      };
    } catch (err) {
      console.error(`Ran into issue creating domain: ${err}`);
      const domains = await this.client.sip.domains.list();
      const domain = domains.find((d) => d.domainName.startsWith(domainName));
      if (domain !== undefined) {
        console.log(`Found matching domain ${domainName} assigning...`);
        return {
          SIP_DOMAIN_SID: domain.sid,
        };
      }
    }
  }

  async createMappedCredentialList({ friendlyName, sipDomainSid }) {
    const credentialList = await this.client.sip.credentialLists.create({
      friendlyName,
    });
    await this.client.sip
      .domains(sipDomainSid)
      .auth.calls.credentialListMappings.create({
        credentialListSid: credentialList.sid,
      });
    await this.client.sip
      .domains(sipDomainSid)
      .auth.registrations.credentialListMappings.create({
        credentialListSid: credentialList.sid,
      });
    await this.client.sip.domains(sipDomainSid).update({
      sipRegistration: true,
    });
    return {
      CREDENTIAL_LIST_SID: credentialList.sid,
    };
  }

  async createDefaultCredentialListForDomain({ sipDomainSid }) {
    const serviceName = this.options.DOMAIN_NAME.replace('.twil.io', '');
    const friendlyName = `${this.options.friendlyName} (${serviceName})`;
    const results = await this.createMappedCredentialList({
      friendlyName,
      sipDomainSid,
    });
    await this.addDefaultCredentials({
      credentialListSid: results.CREDENTIAL_LIST_SID,
    });
    return results;
  }

  async addDefaultCredentials({ credentialListSid }) {
    const usernames = extensions.map((ext) => ext.username);
    await this.addNewCredentials({ credentialListSid, usernames });
  }

  async addNewCredential({ credentialListSid, username, password }) {
    if (password === undefined) {
      password = process.env.DEFAULT_SIP_USER_PASSWORD;
    }
    await this.client.sip
      .credentialLists(credentialListSid)
      .credentials.create({ username, password });
  }

  async addNewCredentials({ credentialListSid, usernames }) {
    for (const username of usernames) {
      await this.addNewCredential({
        credentialListSid,
        username,
      });
    }
  }

  async updateSipDomainVoiceUrl({ sipDomainSid, voiceUrl }) {
    await this.client.sip.domains(sipDomainSid).update({ voiceUrl });
  }

  async chooseLogicalIncomingNumber() {
    const incomingNumbers = await this.client.incomingPhoneNumbers.list();
    return incomingNumbers.find(
      (number) => number.voiceUrl === DEFAULT_TWILIO_WEBHOOK
    );
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

  async updateIncomingNumber({ sid, voiceUrl }) {
    const incomingNumber = await this.client.incomingPhoneNumbers(sid).fetch();
    await incomingNumber.update({ voiceUrl });
    return {
      INCOMING_NUMBER: incomingNumber.phoneNumber,
    };
  }

  clearIncomingNumber() {
    return {
      INCOMING_NUMBER: undefined,
    };
  }

  setCallerId({ number }) {
    return {
      CALLER_ID: number,
    };
  }

  useExistingSipDomain({ sipDomainSid }) {
    return {
      SIP_DOMAIN_SID: sipDomainSid,
    };
  }
}

module.exports = Actions;
