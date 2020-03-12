const assets = Runtime.getAssets();
const {getCurrentEnvironment} = require(assets["/admin/environment.js"].path);

async function checkEnvironmentInitialization(context) {
  const environment = await getCurrentEnvironment(context);
  const status = {
    title: `Environment \`${environment.uniqueName}\` has been initialized`,
    valid: false
  };
  // domainName: environment.domainName,
  // uniqueName: environment.uniqueName,
  // suffix: environment.domainSuffix,

  if (!process.env.INITIALIZED) {
    status.description = `The Twilio Client JavaScript Quickstart requires that you setup a few things on your account. 
We've written some tools that will initialize the various parts to use this tool. To initialize your environment, click the button below.
We'll explain what each of these parts are after we get started.`;
    status.actions = [
      {
        title: `Initialize your application for your environment, ${environment.uniqueName}`,
        name: "initialize",
      }
    ];
  } else {
    status.valid = true;
  }
  return status;
}

async function getTwilioCredentialsFromEnvStatus(context) {
  const status = {
    title: "Your Twilio Credentials are present in your `.env` file",
    valid: false
  };
  // Unset
  if (!(process.env.ACCOUNT_SID && process.env.AUTH_TOKEN)) {
    status.description = `Please edit this environment to include your Account SID and and Auth Token.  These can be found in the [console](https://twilio.com/console).

\`\`\`bash
# Your Account SID beginning with AC
ACCOUNT_SID=ACxxxxx
# Your Auth Token
AUTH_TOKEN=your-auth-token
\`\`\`
      `;
    // Using the default function template API Key, starts with SK
  } else if (!process.env.ACCOUNT_SID.startsWith("AC")) {
    status.description = `The currently stored account information in your \`.env\` file needs to use your official Twilio Account SID (it should start with an \`AC\`). You can find these in the [console](https://twilio.com/console).

  \`\`\`bash
# Your Account SID beginning with AC
ACCOUNT_SID=ACxxxxx
# Your Auth Token
AUTH_TOKEN=your-auth-token

\`\`\``;
  } else {
    status.valid = true;
    status.description = `Current Account SID: \`${process.env.ACCOUNT_SID}\``;
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
    title: `TwiML Application is created and defined in the environment`
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
          title: "Recreate a new TwiML Application",
          name: "createTwimlApp",
          params: {
            friendlyName
          }
        }
      ];
    }
  } else {
    const results = await client.applications.list({ friendlyName });
    if (results.length === 1) {
      const app = results[0];
      status.description = `Make sure you add your TwiML Application SID to your environment

\`\`\`bash
TWIML_APPLICATION_SID=${app.sid}
\`\`\`        
`;
    } else {
      status.description = `We need to create a new TwiML Application. You can do this by clicking the button below. 
          
You can do this [via the API or CLI](https://www.twilio.com/docs/usage/api/applications?code-sample=code-create-a-new-application-within-your-account&code-language=curl&code-sdk-version=json).`;
      status.actions = [
        {
          title: "Create a new TwiML Application",
          name: "createTwimlApp",
          params: {
            friendlyName
          }
        }
      ];
    }
  }
  return status;
}

function getHost(context) {
  if (context.VIRTUAL_HOST !== context.DOMAIN_NAME) {
    return context.VIRTUAL_HOST;
  }
  const actualHost = context.DOMAIN_NAME.split(":")[0];
  return actualHost;
}

function isHostAccessible(context) {
  const host = getHost(context);
  return host !== "localhost" && host !== "127.0.0.1";
}

async function getHostIsAccessibleStatus(context) {
  const host = getHost(context);
  const status = {
    title: "Host is accessible to the public Internet",
    valid: false
  };
  if (!isHostAccessible(context)) {
    status.description = `Your application hosted at \`${host}\` is not accessible to the public Internet. 
  Deploy your function by using the following command at the console:
  
  \`\`\`bash
  twilio serverless:deploy
  \`\`\`\
  
  Optionally, you can use a tunneling service like [ngrok](https://ngrok.com) to expose your server to the public Internet.
  
  After your correct this, revisit this admin page on your public facing host.
  `;
  } else {
    status.valid = true;
    status.description = "Twilio can now access your hosted functions";
  }
  return status;
}

async function getCallerIdStatus(context) {
  const client = context.getTwilioClient();
  const callerId = process.env.CALLER_ID;
  const status = {
    valid: false,
    title: "Caller ID is set to a valid number"
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
      status.description = `Your CallerID is set to ${process.env.CALLER_ID}, but that number is not yet verified.
You can [verify it via the console](https://www.twilio.com/console/phone-numbers/verified), [CLI or API](https://www.twilio.com/docs/voice/api/outgoing-caller-ids).
`;
    }
  } else {
    status.description = `Your outgoing caller ID can be set to any Twilio number that you've purchased or any numbers that are verified on your account. `;
    status.actions = incomingNumbers.map(num => ({
      title: `Choose Twilio # ${num.friendlyName}`,
      name: "setCallerId",
      params: {
        number: num.phoneNumber
      }
    }));
    status.actions = status.actions.concat(
      outgoingCallerIds.map(num => ({
        title: `Choose Verified # ${num.friendlyName}`,
        name: "setCallerId",
        params: {
          number: num.phoneNumber
        }
      }))
    );
  }
  return status;
}

async function getTwiMLApplicationIsWiredUp(context) {
  const client = context.getTwilioClient();
  const expectedFn = `https://${getHost(context)}/client-voice-twiml-app`;
  twimlApplicationSid = process.env.TWIML_APPLICATION_SID;
  const status = {
    title: "TwiML Application is configured to use incoming call function",
    valid: false
  };
  if (!twimlApplicationSid) {
    status.description =
      "After you update your environment, you can wire up your TwiML Application safely.";
  } else if (!isHostAccessible(context)) {
    status.description =
      "In order for Twilio to reach your application, it must be publicly accessible on the Internet.";
  } else {
    try {
      const app = await client.applications(twimlApplicationSid).fetch();
      if (app.voiceUrl === expectedFn) {
        status.valid = true;
        status.description = `TwiML Application Voice URL: \`${expectedFn}\``;
      } else {
        status.description = `Your TwiML Application's ( [${app.friendlyName}](https://www.twilio.com/console/voice/twiml/apps/${app.sid}) ) current Incoming Voice Url is \`${app.voiceUrl}\`. 

To work in this environment the Incoming Voice Url should be set to \`${expectedFn}\`. 

You can update this by clicking the button below.
  `;
        status.actions = [
          {
            title: `Update TwiML App Incoming Voice Webhook`,
            name: "updateTwimlAppVoiceUrl",
            params: {
              twimlApplicationSid,
              voiceUrl: expectedFn
            }
          }
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
      "The API Key and Secret for minting Access Tokens is accessible from the current environment",
    valid: false
  };

  // Set
  if (process.env.API_KEY && process.env.API_SECRET) {
    try {
      const key = await client.keys(process.env.API_KEY).fetch();
      status.valid = true;
      status.description = `Your web application will mint AccessTokens using your [${key.friendlyName} API Key](https://www.twilio.com/console/voice/settings/api-keys/${process.env.API_KEY})`;
    } catch (err) {
      status.description = `Uh oh, unable to find your API Key \`${process.env.API_KEY}\`.
  Please [double check your key](https://www.twilio.com/console/voice/settings/api-keys/) or create a new one by removing it from your \`.env\` file.`;
    }
  } else {
    status.description = `This application uses a REST API Key and Secret to mint AccessTokens.

If you already have an API Key created for this purpose you can set the environment properties, \`API_KEY\` and \`API_SECRET\`.

Alternatively you can generate a new key by clicking the button below. 
    `;
    status.actions = [
      {
        title: "Generate a new REST API Key and Secret",
        name: "generateNewKey",
        params: {
          friendlyName: process.env.APP_NAME
        }
      }
    ];
  }
  return status;
}

module.exports = {
  environment: checkEnvironmentInitialization,
  statuses: [
    getTwilioCredentialsFromEnvStatus,
    getTwiMLApplicationStatus,
    getHostIsAccessibleStatus,
    getTwiMLApplicationIsWiredUp,
    getAPIKeyAndSecretFromEnvStatus,
    getCallerIdStatus
  ]
};
