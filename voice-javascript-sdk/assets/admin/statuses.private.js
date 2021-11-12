/* eslint-disable no-negated-condition */
const { stripIndents } = require('common-tags');

const assets = Runtime.getAssets();
const { getCurrentEnvironment, urlForSiblingPage } = require(assets[
  '/admin/shared.js'
].path);

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
  } else if (!process.env.INITIALIZED) {
    status.description = stripIndents`
    The Twilio Voice JavaScript SDK Quickstart requires that you setup a few things on your account. 
    
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
    status.description = `Your application is initialized! View your [running application](../index.html)`;
  }
  return status;
}

function missingTwimlApplicationError(error) {
  return `Uh oh, couldn't find your specified [TwiML Application](https://www.twilio.com/console/voice/twiml/apps/) (\`${process.env.TWIML_APPLICATION_SID}\`).`;
}

async function getTwiMLApplicationStatus(context) {
  const client = context.getTwilioClient();
  const friendlyName = process.env.APP_NAME;
  const status = {
    valid: false,
    title: `TwiML Application is created and defined in the environment`,
  };
  if (process.env.TWIML_APPLICATION_SID) {
    try {
      const app = await client
        .applications(process.env.TWIML_APPLICATION_SID)
        .fetch();
      status.valid = true;
      status.description = `TwiML Application: [${app.friendlyName}](https://www.twilio.com/console/voice/twiml/apps/${app.sid})`;
    } catch (err) {
      status.description = missingTwimlApplicationError(err);
      status.actions = [
        {
          title: 'Recreate a new TwiML Application',
          name: 'createTwimlApp',
          params: {
            friendlyName,
          },
        },
      ];
    }
  } else {
    const results = await client.applications.list({ friendlyName });
    if (results.length >= 1) {
      const app = results[0];
      status.description = stripIndents`
      We found an existing [TwiML Application](https://www.twilio.com/console/voice/twiml/apps/${app.sid}) with the name of \`${friendlyName}\.
      
      Would you like to use this app?
      `;
      status.actions = [
        {
          title: 'Use existing TwiML application',
          name: 'useExistingTwimlApp',
          params: {
            twimlApplicationSid: app.sid,
          },
        },
        {
          title: 'Do not use existing TwiML application, create a new one',
          name: 'createTwimlApp',
          params: {
            friendlyName,
          },
        },
      ];
    } else {
      status.description = stripIndents`
      We need to create a new TwiML Application. You can do this by clicking the button below.
      
      You can do this [via the API or CLI](https://www.twilio.com/docs/usage/api/applications?code-sample=code-create-a-new-application-within-your-account&code-language=curl&code-sdk-version=json).
      `;
      status.actions = [
        {
          title: 'Create a new TwiML Application',
          name: 'createTwimlApp',
          params: {
            friendlyName,
          },
        },
      ];
    }
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
      status.description = `Your CallerID is set to ${process.env.CALLER_ID}`;
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

async function getTwiMLApplicationIsWiredUp(context) {
  const client = context.getTwilioClient();
  const expectedFn = `https://${context.DOMAIN_NAME}${urlForSiblingPage(
    'voice-javascript-sdk-twiml-app',
    context.PATH,
    '..'
  )}`;
  twimlApplicationSid = process.env.TWIML_APPLICATION_SID;
  const status = {
    title: 'TwiML Application is configured to use incoming call function',
    valid: false,
  };
  if (!twimlApplicationSid) {
    status.description =
      'After you update your environment, you can wire up your TwiML Application safely.';
  } else {
    try {
      const app = await client.applications(twimlApplicationSid).fetch();
      if (app.voiceUrl === expectedFn) {
        status.valid = true;
        status.description = `TwiML Application Voice URL: \`${expectedFn}\``;
      } else {
        status.description = stripIndents`
        Your TwiML Application's ( [${app.friendlyName}](https://www.twilio.com/console/voice/twiml/apps/${app.sid}) ) current Incoming Voice Url is \`${app.voiceUrl}\`. 
        
        To work in this environment the Incoming Voice Url should be set to \`${expectedFn}\`. 
        
        You can update this by clicking the button below.
        `;
        status.actions = [
          {
            title: `Update TwiML App Incoming Voice Webhook`,
            name: 'updateTwimlAppVoiceUrl',
            params: {
              twimlApplicationSid,
              voiceUrl: expectedFn,
            },
          },
        ];
      }
    } catch (err) {
      status.description = missingTwimlApplicationError(err);
    }
  }
  return status;
}

async function getAPIKeyAndSecretFromEnvStatus(context) {
  const client = context.getTwilioClient();
  const status = {
    title:
      'The API Key and Secret for minting Access Tokens is accessible from the current environment',
    valid: false,
  };

  // Set
  if (process.env.API_KEY && process.env.API_SECRET) {
    try {
      const key = await client.keys(process.env.API_KEY).fetch();
      status.valid = true;
      status.description = `Your web application will mint AccessTokens using your [${key.friendlyName} API Key](https://www.twilio.com/console/voice/settings/api-keys/${process.env.API_KEY})`;
    } catch (err) {
      status.description = stripIndents`
      Uh oh, unable to find your API Key \`${process.env.API_KEY}\`.
      
      Please [double check your key](https://www.twilio.com/console/voice/settings/api-keys/) or create a new one.
      `;
      status.actions = [
        {
          title: 'Generate a new REST API Key and Secret',
          name: 'generateNewKey',
          params: {
            friendlyName: process.env.APP_NAME,
          },
        },
      ];
    }
  } else {
    status.description = stripIndents`
    This application uses a REST API Key and Secret to mint AccessTokens.
    
    If you already have an API Key created for this purpose you can set the environment values, \`API_KEY\` and \`API_SECRET\`.
    
    Alternatively you can generate a new key by clicking the button below.
    `;
    status.actions = [
      {
        title: 'Generate a new REST API Key and Secret',
        name: 'generateNewKey',
        params: {
          friendlyName: process.env.APP_NAME,
        },
      },
    ];
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
    getTwiMLApplicationStatus,
    getTwiMLApplicationIsWiredUp,
    getAPIKeyAndSecretFromEnvStatus,
    getCallerIdStatus,
    getDefaultPasswordChanged,
  ],
};
