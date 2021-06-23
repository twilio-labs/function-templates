const { stripIndents } = require('common-tags');

const assets = Runtime.getAssets();
const { getCurrentEnvironment, urlForSiblingPage } = require(assets[
  '/admin/shared.js'
].path);
const extensions = require(assets['/extensions.js'].path);

async function checkEnvironmentInitialization(context) {
  const environment = await getCurrentEnvironment(context);
  const status = {
    title: `Environmental Checks`,
    valid: false,
  };
  if (!environment) {
    status.description = stripIndents`
    This application is **must be** deployed. 
    
    To deploy this function, use the following command:
    
    \`\`\`bash
    twilio serverless:deploy
    \`\`\`
    After it has been deployed, revisit this page in your deployed application.
    `;
    // eslint-disable-next-line no-negated-condition
  } else if (!process.env.INITIALIZED) {
    status.description = stripIndents`
    The SIP Quickstart requires that you setup a few things on your account. 
    
    We've written some tools that will initialize the various parts to use this tool.
    
    To initialize your environment, click the button below.
    
    We'll explain what each of these parts are after we get started.
    `;
    status.actions = [
      {
        title: `Initialize your application for your environment, ${environment.uniqueName}`,
        name: 'initialize',
      },
    ];
  } else {
    status.valid = true;
    status.description = stripIndents`
    Your application is initialized! View your [running application](../index.html)

    The *default* password for the credentials that were created is \`${context.DEFAULT_SIP_USER_PASSWORD}\`.
    `;
  }
  return status;
}

function missingSipDomainError(error) {
  return `Uh oh, couldn't find your specified [SIP Domain](https://www.twilio.com/console/voice/sip/endpoints) (\`${process.env.SIP_DOMAIN_SID}\`).`;
}

async function getSipDomainStatus(context) {
  const client = context.getTwilioClient();
  const friendlyName = process.env.APP_NAME;
  const domainName = context.DOMAIN_NAME;
  const status = {
    valid: false,
    title: `SIP Domain is created and defined in the environment`,
  };
  if (process.env.SIP_DOMAIN_SID) {
    try {
      const domain = await client.sip
        .domains(process.env.SIP_DOMAIN_SID)
        .fetch();
      status.valid = true;
      status.description = `SIP Domain: [${domain.friendlyName}](https://www.twilio.com/console/voice/sip/endpoints/${domain.sid})`;
    } catch (err) {
      status.description = missingSipDomainError(err);
      status.actions = [
        {
          title: 'Recreate a new SIP Domain',
          name: 'createSipDomain',
          params: {
            friendlyName,
            domainName,
          },
        },
      ];
    }
  } else {
    // eslint-disable-next-line no-warning-comments
    // TODO: Does this work? NO!
    const results = await client.sip.domains.list({ friendlyName });
    if (results.length >= 1) {
      const domain = results[0];
      status.description = stripIndents`
      We found an existing [SIP Domain](https://www.twilio.com/console/voice/sip/endpoints/${domain.sid}) with the name of \`${friendlyName}\.
      
      Would you like to use this app?
      `;
      status.actions = [
        {
          title: 'Use existing SIP Domain',
          name: 'useExistingSipDomain',
          params: {
            sipDomainSid: domain.sid,
          },
        },
        {
          title: 'Do not use existing SIP domain, create a new one',
          name: 'createSipDomain',
          params: {
            friendlyName,
            domainName,
          },
        },
      ];
    } else {
      status.description = stripIndents`
      We need to create a new SIP Domain. You can do this by clicking the button below.
      
      You can do this [via the API or CLI](https://www.twilio.com/docs/voice/sip/api/sip-domain-resource?code-sample=code-create-a-sipdomain-resource&code-language=Node.js&code-sdk-version=3.x).
      `;
      status.actions = [
        {
          title: 'Create a new SIP Domain',
          name: 'createSipDomain',
          params: {
            friendlyName,
            domainName,
          },
        },
      ];
    }
  }
  return status;
}

async function getCredentialListStatus(context) {
  const client = context.getTwilioClient();
  const sipDomainSid = process.env.SIP_DOMAIN_SID;
  const status = {
    valid: false,
    title:
      'Default Credential List is created, loaded and mapped to your SIP Domain',
  };
  const createAction = {
    title: 'Create new default credential list',
    name: 'createDefaultCredentialListForDomain',
    params: {
      sipDomainSid,
    },
  };

  const credentialListSid = process.env.CREDENTIAL_LIST_SID;
  // Exists
  if (credentialListSid) {
    try {
      const credentialList = await client.sip
        .credentialLists(credentialListSid)
        .fetch();
      const credentials = await client.sip
        .credentialLists(credentialListSid)
        .credentials.list();
      const actualUsernames = new Set(credentials.map((cred) => cred.username));
      const expectedUsernames = extensions.map((ext) => ext.username);
      // expectedUsernames - actualUsernames :( Sets in JS
      const missing = expectedUsernames.filter((u) => !actualUsernames.has(u));
      if (missing.length === 0) {
        status.valid = true;
        status.description = stripIndents`
          Your default credential list [${credentialList.friendlyName}](https://www.twilio.com/console/voice/sip/cls/${credentialList.sid}) contains the ${expectedUsernames.length} expected accounts.
        `;
      } else {
        status.description = stripIndents`
          Your default credential list [${
            credentialList.friendlyName
          }](https://www.twilio.com/console/voice/sip/cls/${
          credentialList.sid
        }) is missing the following accounts:

          ${missing.join(', ')}
        `;

        status.actions = [
          {
            name: 'addNewCredentials',
            title: 'Add missing credentials',
            params: {
              credentialListSid,
              usernames: missing,
            },
          },
        ];
      }
    } catch (err) {
      console.log(`Error: ${err}`);
      status.description = `Uh oh. We were unable to find your default credential list defined in your environment. Let's build a new one.`;
      status.actions = [createAction];
    }
  } else {
    status.description =
      "You currently haven't defined the Default Credential List.";
    status.actions = [createAction];
  }
  return status;
}

async function getIncomingNumberStatus(context) {
  const client = context.getTwilioClient();
  const incomingNumber = process.env.INCOMING_NUMBER;
  const expectedFn = `https://${context.DOMAIN_NAME}${urlForSiblingPage(
    'extension-menu',
    context.PATH,
    '..'
  )}`;
  const status = {
    valid: false,
    title: 'Incoming Number is defined and wired up',
  };
  const allIncomingNumbers = await client.incomingPhoneNumbers.list();
  chooseNumberActions = allIncomingNumbers.map((number) => {
    return {
      title: `Choose ${number.friendlyName}`,
      name: 'updateIncomingNumber',
      params: {
        sid: number.sid,
        voiceUrl: expectedFn,
      },
    };
  });
  // Is Set
  if (incomingNumber) {
    const numberObject = allIncomingNumbers.find(
      (n) => n.phoneNumber === incomingNumber
    );
    // Was found
    if (numberObject) {
      // Wired up
      if (numberObject.voiceUrl === expectedFn) {
        status.valid = true;
        status.description = `Your incoming number is set to ${incomingNumber} and the incoming Webhook is set to \`${numberObject.voiceUrl}\``;
        status.actions = [
          {
            title: 'Choose a different incoming number',
            name: 'clearIncomingNumber',
          },
        ];
      } else {
        status.description = stripIndents`
        Your currently defined incoming number ${incomingNumber} has a Webhook set to \`${numberObject.voiceUrl}\` when it should be \`${expectedFn}\`

        Update this by choosing the action below.
        `;
        status.actions = [
          {
            title: `Update ${incomingNumber} incoming webhook`,
            name: 'updateIncomingNumberVoiceUrl',
            params: {
              sid: numberObject.sid,
              voiceUrl: expectedFn,
            },
          },
          {
            title: 'Choose a different incoming number',
            name: 'clearIncomingNumber',
          },
        ];
      }
      // Not found
    } else {
      status.description = stripIndents`
      Uh oh. Your incoming number ${process.env.INCOMING_NUMBER} is no longer found.

      Choose from an existing number or [buy a new one](https://www.twilio.com/console/phone-numbers/search).

      `;
      status.actions = chooseNumberActions;
    }
  } else {
    status.description = stripIndents`
    Choose from your existing Twilio numbers or [buy a new one](https://www.twilio.com/console/phone-numbers/search)
    `;
    status.actions = chooseNumberActions;
  }
  return status;
}

async function getCallerIdStatus(context) {
  const client = context.getTwilioClient();
  const callerId = process.env.CALLER_ID;
  const status = {
    valid: false,
    title: 'Caller ID is set to a valid number',
  };
  // Get All Owned Numbers and Verified Numbers
  const incomingNumbers = await client.incomingPhoneNumbers.list();
  const outgoingCallerIds = await client.outgoingCallerIds.list();
  function finder(numberObject) {
    return numberObject.phoneNumber === process.env.CALLER_ID;
  }
  if (process.env.CALLER_ID) {
    if (incomingNumbers.find(finder) || outgoingCallerIds.find(finder)) {
      status.valid = true;
      status.description = `Your Caller ID is set to ${process.env.CALLER_ID}`;
      status.actions = [
        {
          name: 'setCallerId',
          title: 'Choose a new Caller ID',
          params: {
            number: undefined,
          },
        },
      ];
    } else {
      status.description = stripIndents`
      Your CallerID is set to ${process.env.CALLER_ID}, but that number is not yet verified.
      
      You can [verify it via the console](https://www.twilio.com/console/phone-numbers/verified), [CLI or API](https://www.twilio.com/docs/voice/api/outgoing-caller-ids).
      `;
    }
  } else {
    status.description = `Your outgoing caller ID can be set to any Twilio number that you've purchased or any numbers that are verified on your account. `;
    status.actions = incomingNumbers.map((num) => ({
      title: `Choose Twilio # ${num.friendlyName}`,
      name: 'setCallerId',
      params: {
        number: num.phoneNumber,
      },
    }));
    status.actions = status.actions.concat(
      outgoingCallerIds.map((num) => ({
        title: `Choose Verified # ${num.friendlyName}`,
        name: 'setCallerId',
        params: {
          number: num.phoneNumber,
        },
      }))
    );
  }
  return status;
}

async function getSipDomainIsWiredUp(context) {
  const client = context.getTwilioClient();
  const expectedFn = `https://${context.DOMAIN_NAME}${urlForSiblingPage(
    'outbound-calls',
    context.PATH,
    '..'
  )}`;
  const sipDomainSid = process.env.SIP_DOMAIN_SID;
  const status = {
    title: 'SIP Domain is configured to route outbound calls',
    valid: false,
  };
  // eslint-disable-next-line no-negated-condition
  if (!sipDomainSid) {
    status.description =
      'After you update your environment, you can wire up your SIP Domain correctly.';
  } else {
    try {
      const domain = await client.sip.domains(sipDomainSid).fetch();
      if (domain.voiceUrl === expectedFn) {
        status.valid = true;
        status.description = `SIP Domain Voice URL: \`${expectedFn}\``;
      } else {
        status.description = stripIndents`
        Your SIP Domain's ( [${domain.friendlyName}](https://www.twilio.com/console/voice/sip/endpoints/${domain.sid}) ) current Incoming Voice Url is \`${domain.voiceUrl}\`. 
        
        To work in this environment the Incoming Voice Url should be set to \`${expectedFn}\`. 
        
        You can update this by clicking the button below.
        `;
        status.actions = [
          {
            title: `Update SIP Domain Voice Webhook`,
            name: 'updateSipDomainVoiceUrl',
            params: {
              sipDomainSid,
              voiceUrl: expectedFn,
            },
          },
        ];
      }
    } catch (err) {
      status.description = missingSipDomainError(err);
    }
  }
  return status;
}
async function getDefaultPasswordChanged(context) {
  const status = {
    title: 'Default admin password has been changed',
    valid: false,
  };
  if (process.env.ADMIN_PASSWORD === 'default') {
    status.description = stripIndents`
    Please take a moment to change your admin password from the provided default password. 
    
    You can do this by editing the \`ADMIN_PASSWORD\` value in the \`.env\` in the root of this project.
    
    After you have saved that file, please redeploy.

    \`\`\`bash
    twilio serverless:deploy
    \`\`\`
    `;
  } else {
    status.valid = true;
    status.description =
      "You're all set. You can change this value in your `.env` file at anytime.";
  }
  return status;
}

module.exports = {
  environment: checkEnvironmentInitialization,
  statuses: [
    getSipDomainStatus,
    getSipDomainIsWiredUp,
    getCredentialListStatus,
    getIncomingNumberStatus,
    getCallerIdStatus,
    getDefaultPasswordChanged,
  ],
};
