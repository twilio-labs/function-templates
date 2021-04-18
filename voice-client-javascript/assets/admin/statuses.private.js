const { stripIndents } = require("common-tags");
const assets = Runtime.getAssets();
const {
  getCurrentEnvironment,
  urlForSiblingPage,
  usesFunctionUi,
} = require(assets["/admin/shared.js"].path);

async function checkEnvironmentInitialization(context) {
  const environment = await getCurrentEnvironment(context);
  const status = {
    title: `Environmental Checks`,
    valid: false,
  };
  if (!environment) {
    status.description = stripIndents`
    This application **must be** deployed. 
    
    To deploy this function, use the following command:
    
    \`\`\`bash
    twilio serverless:deploy
    \`\`\`

    After it has been deployed, revisit this page in your deployed application.
    `;
  } else if (!context.INITIALIZED) {
    status.description = stripIndents`
    The Twilio Client JavaScript Quickstart requires that you setup a few things on your account. 
    
    To initialize your environment, click the button below.
    
    We'll explain what each of these parts are after we get started.
    `;
    status.actions = [
      {
        title: `Initialize your application for your environment, ${environment.uniqueName}`,
        name: "initialize",
      },
    ];
  } else {
    status.valid = true;
    status.description = `Your application is initialized! View your [running application](../browser.html)`;
  }
  return status;
}

function missingTwimlApplicationError(context, error) {
  return `Uh oh, couldn't find your specified [TwiML Application](https://www.twilio.com/console/voice/twiml/apps/) (\`${context.TWIML_APPLICATION_SID}\`).`;
}

async function getTwiMLApplicationStatus(context) {
  const client = context.getTwilioClient();
  const friendlyName = context.APP_NAME;
  const status = {
    valid: false,
    title: `TwiML Application is created and defined in the environment`,
  };
  if (context.TWIML_APPLICATION_SID) {
    try {
      const app = await client
        .applications(context.TWIML_APPLICATION_SID)
        .fetch();
      status.valid = true;
      status.description = `TwiML Application: [${app.friendlyName}](https://www.twilio.com/console/voice/twiml/apps/${app.sid})`;
    } catch (err) {
      status.description = missingTwimlApplicationError(context, err);
      status.actions = [
        {
          title: "Recreate a new TwiML Application",
          name: "createTwimlApp",
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
          title: "Use existing TwiML application",
          name: "useExistingTwimlApp",
          params: {
            twimlApplicationSid: app.sid,
          },
        },
        {
          title: "Do not use existing TwiML application, create a new one",
          name: "createTwimlApp",
          params: {
            friendlyName,
          },
        },
      ];
    } else {
      status.description = stripIndents`
      We need to create a new TwiML Application. You can do this by clicking the button below.
      
      You could also do this [via the API or CLI](https://www.twilio.com/docs/usage/api/applications?code-sample=code-create-a-new-application-within-your-account&code-language=curl&code-sdk-version=json).
      `;
      status.actions = [
        {
          title: "Create a new TwiML Application",
          name: "createTwimlApp",
          params: {
            friendlyName,
          },
        },
      ];
    }
  }
  return status;
}

async function getIncomingNumberStatus(context) {
  const client = context.getTwilioClient();
  const status = {
    valid: false,
    title: "Incoming Number is wired up correctly",
  };
  const incomingNumbers = await client.incomingPhoneNumbers.list();
  const incomingNumber = incomingNumbers.find((numberObject) => {
    return numberObject.phoneNumber === context.INCOMING_NUMBER;
  });

  // Not found
  if (incomingNumber === undefined) {
    //Not set
    if (context.INCOMING_NUMBER === undefined) {
      if (incomingNumbers.length > 0) {
        status.description = stripIndents`
        Please choose an incoming number below. If you would like, you can [purchase a new Twilio number](https://www.twilio.com/console/phone-numbers/search) to automatically connect to your clients.
        `;
      } else {
        status.description = stripIndents`
        Looks like you haven't purchased any numbers yet. 
        If you would like, you can [purchase a new Twilio number](https://www.twilio.com/console/phone-numbers/search) to automatically connect to your clients.

        Refresh this page and it will show up.
        `;
      }
    } else {
      status.description = stripIndents`
      Your incoming number is set to ${context.INCOMING_NUMBER}, but that number is unavailable. Please choose a new incoming number.'
      `;
    }
    // Show number options
    status.actions = incomingNumbers.map((num) => ({
      title: `Choose Twilio # ${num.friendlyName}`,
      name: "updateIncomingNumber",
      params: {
        sid: num.sid,
        voiceApplicationSid: context.TWIML_APPLICATION_SID,
      },
    }));
  } else {
    // Found
    // Is it wired up correctly?
    if (context.TWIML_APPLICATION_SID === incomingNumber.voiceApplicationSid) {
      status.valid = true;
      // TODO: This can point to the actual function
      // /console/functions/editor/${service.sid}/environment/${environment.sid}/function/${function.sid}
      status.description = stripIndents`
      Your incoming number ${incomingNumber.friendlyName} (${incomingNumber.phoneNumber}) is wired up to route calls via the TwiML application incoming handler **/client-voice-twiml** to a registered client named ${context.DEFAULT_CLIENT_NAME}.
      `;
      status.actions = [
        {
          title: "Choose a new incoming number",
          name: "clearIncomingNumber",
        },
      ];
    } else {
      status.description = stripIndents`
      Your incoming number ${incomingNumber.friendlyName} is wired up to a a different Voice Application: "${incomingNumber.voiceApplicationSid}".
      It is expected to be wired up to "${context.TWIML_APPLICATION_SID}".
      `;
      status.actions = [
        {
          title: "Wire up your number to the correct application",
          name: "updateIncomingNumber",
          params: {
            sid: incomingNumber.sid,
            voiceApplicationSid: context.TWIML_APPLICATION_SID,
          },
        },
        {
          title: "Choose a new incoming number",
          name: "clearIncomingNumber",
        },
      ];
    }
  }
  return status;
}

async function getCallerIdStatus(context) {
  const client = context.getTwilioClient();
  const callerId = context.CALLER_ID;
  const status = {
    valid: false,
    title: "Caller ID is set to a valid number",
  };
  // Get All Owned Numbers and Verified Numbers
  const incomingNumbers = await client.incomingPhoneNumbers.list();
  const outgoingCallerIds = await client.outgoingCallerIds.list();
  function finder(numberObject) {
    return numberObject.phoneNumber === context.CALLER_ID;
  }
  if (callerId) {
    if (incomingNumbers.find(finder) || outgoingCallerIds.find(finder)) {
      status.valid = true;
      status.description = `Your CallerID is set to ${context.CALLER_ID}`;
    } else {
      status.description = stripIndents`
      Your CallerID is set to ${context.CALLER_ID}, but that number is not yet verified.
      
      You can [verify it via the console](https://www.twilio.com/console/phone-numbers/verified), [CLI, or API](https://www.twilio.com/docs/voice/api/outgoing-caller-ids).
      `;
    }
    status.actions = [
      {
        title: "Choose a different CallerID",
        name: "clearCallerId",
      },
    ];
  } else {
    status.description = `Your outgoing caller ID can be set to any Twilio number that you've purchased or any numbers that are verified on your account. `;
    status.actions = incomingNumbers.map((num) => ({
      title: `Choose Twilio # ${num.friendlyName}`,
      name: "setCallerId",
      params: {
        number: num.phoneNumber,
      },
    }));
    status.actions = status.actions.concat(
      outgoingCallerIds.map((num) => ({
        title: `Choose Verified # ${num.friendlyName}`,
        name: "setCallerId",
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
    "client-voice-twiml-app",
    context.PATH,
    ".."
  )}`;
  twimlApplicationSid = context.TWIML_APPLICATION_SID;
  const status = {
    title: "TwiML Application is configured to use incoming call function",
    valid: false,
  };
  if (!twimlApplicationSid) {
    status.description =
      "After you update your environment, you can wire up your TwiML Application safely.";
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
            name: "updateTwimlAppVoiceUrl",
            params: {
              twimlApplicationSid,
              voiceUrl: expectedFn,
            },
          },
        ];
      }
    } catch (err) {
      status.description = missingTwimlApplicationError(context, err);
    }
  }
  return status;
}

async function getAPIKeyAndSecretFromEnvStatus(context) {
  const client = context.getTwilioClient();
  const status = {
    title:
      "The API Key and Secret for minting Access Tokens is accessible from the current environment",
    valid: false,
  };

  // Set
  if (context.API_KEY && context.API_SECRET) {
    try {
      const key = await client.keys(context.API_KEY).fetch();
      status.valid = true;
      status.description = `Your web application will mint AccessTokens using your [${key.friendlyName} API Key](https://www.twilio.com/console/voice/settings/api-keys/${context.API_KEY})`;
    } catch (err) {
      status.description = stripIndents`
      Uh oh, unable to find your API Key \`${context.API_KEY}\`.
      
      Please [double check your key](https://www.twilio.com/console/voice/settings/api-keys/) or create a new one.
      `;
      status.actions = [
        {
          title: "Generate a new REST API Key and Secret",
          name: "generateNewKey",
          params: {
            friendlyName: context.APP_NAME,
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
        title: "Generate a new REST API Key and Secret",
        name: "generateNewKey",
        params: {
          friendlyName: context.APP_NAME,
        },
      },
    ];
  }
  return status;
}

async function getDefaultPasswordChanged(context) {
  const status = {
    title: "Default admin password has been changed",
    valid: false,
  };
  const env = await getCurrentEnvironment(context);
  if (context.ADMIN_PASSWORD === "default") {
    status.description = stripIndents`
    Please take a moment to change your admin password from the provided default password. 
    
    You can do this by editing the \`ADMIN_PASSWORD\` value in your environment.`;
    
    if (await usesFunctionUi(context)) {
      const consoleUrl = `https://www.twilio.com/console/functions/editor/${env.serviceSid}/environment/${env.sid}/config/variables`;
      status.description += stripIndents`
      Change the [\`ADMIN_PASSWORD\` environment variable on the Environment tab](${consoleUrl}) of your Functions editor.

      After updating environment variables you must redeploy your Application. Press the **Deploy All** button on the Functions editor.
      `;
    } else {
      status.description += stripIndents`
      Update your local \`.env\` file and then re-deploy using the CLI

      \`\`\`
      twilio serverless:deploy
      \`\`\`
      `;
    }
  } else {
    status.valid = true;
    status.description =
      "You're all set. You can change this value in your environment at anytime.";
    if (await usesFunctionUi(context)) {
      status.description += stripIndents`
        To change the admin password head over to [the Environment tab](${consoleUrl}) of your Functions editor.
  
        After updating environment variables you must redeploy your Application. Press the **Deploy All** button on the Functions editor.
        `;
    } else {
      status.description += stripIndents`
        Update your local \`.env\` file and then re-deploy using the CLI
  
        \`\`\`
        twilio serverless:deploy
        \`\`\`
        `;
    }
  }
  return status;
}

module.exports = {
  environment: checkEnvironmentInitialization,
  statuses: [
    getTwiMLApplicationStatus,
    getTwiMLApplicationIsWiredUp,
    getAPIKeyAndSecretFromEnvStatus,
    getIncomingNumberStatus,
    getCallerIdStatus,
    getDefaultPasswordChanged,
  ],
};
