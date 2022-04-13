const crypto = require('crypto');
const path = require('path');

// Change the salt to invalidate tokens
const SALT = 'salty';

// Creates a token for client side usage
function createToken(context, password) {
  const tokenString = `${context.ACCOUNT_SID}:${password}:${SALT}`;
  // Similar to TwilioClient
  return crypto
    .createHmac('sha1', context.AUTH_TOKEN)
    .update(Buffer.from(tokenString, 'utf-8'))
    .digest('base64');
}

function isAllowed(context, token) {
  // Create the token with the environment password
  const masterToken = createToken(context, process.env.ADMIN_PASSWORD);
  return masterToken === token;
}

// Shortcuts by calling the callback with an error
function checkAuthorization(context, event, callback) {
  if (!isAllowed(context, event.token)) {
    const response = new Twilio.Response();
    response.setStatusCode(403);
    response.setBody('Not authorized');
    callback(null, response);
    return false;
  }
  return true;
}

async function getCurrentEnvironment(context) {
  if (context.DOMAIN_NAME && context.DOMAIN_NAME.startsWith('localhost')) {
    return;
  }
  const client = context.getTwilioClient();
  const services = await client.serverless.services.list();
  for (const service of services) {
    const environments = await client.serverless
      .services(service.sid)
      .environments.list();
    const environment = environments.find(
      (env) => env.domainName === context.DOMAIN_NAME
    );
    if (environment) {
      // Exit the function
      // eslint-disable-next-line consistent-return
      return environment;
    }
  }
}

function adminPasswordChangedFromDefault() {
  if (process.env.process.env.ADMIN_PASSWORD === "default") {
    return false
  }
  return true
}

function adminPasswordMeetsComplexityRequirements() {
  const regex = new RegExp('^(?=.*d)(?=.*[a-z])(?=.*[A-Z]).{12,}$');
  if (regex.test(process.env.ADMIN_PASSWORD)) {
    return true
  }
  return false
}

async function generateEnvVariableInstructions(context) {
  const env = await getCurrentEnvironment(context);

  if (env) {
    const client = context.getTwilioClient();
    const service = await client.serverless.services(env.serviceSid).fetch();
    if (service.uiEditable) {
      const consoleUrl = `https://console.twilio.com/service/functions/${env.serviceSid}/runtime-functions-editor?currentFrameUrl=%2Fconsole%2Ffunctions%2Feditor%2F${env.serviceSid}%2Fenvironment%2F${env.sid}%2Fconfig%2Fvariables`;

      return `<p>You can change the admin password by editing the <code>ADMIN_PASSWORD</code> value on the <a href=${consoleUrl} target="_blank">Environment tab of your Functions editor</a>.</p>
        <p>After updating environment variables, you must redeploy your application by pressing the <strong>Deploy All</strong> button in your Functions editor.</p>`;
    }
  }

  return `<p>You can change the admin password by editing the <code>ADMIN_PASSWORD</code> value in the <code>.env</code> file in the root of this project.</p>
    <p>After you have edited and saved your <code>.env</code> file, please redeploy with the following command:</p>
    <code>twilio serverless:deploy</code>`;
}

async function checkAdminPassword(context, event, callback) {
  const response = new Twilio.Response();
  let responseBody;

  if (adminPasswordChangedFromDefault() === false) {
    response.setStatusCode(403);

    responseBody = `<p>You must change your admin password.</p>`;
  } else if (adminPasswordMeetsComplexityRequirements() === false) {
    response.setStatusCode(403);

    responseBody = `<p>Your admin password does not meet the complexity requirements.</p>`;
  } else {
    response.setStatusCode(200);
    callback(null, response);
    return true;
  }

  responseBody += await generateEnvVariableInstructions(context);

  response.setBody(responseBody);
  callback(null, response);
  return false;
}

async function getEnvironmentVariables(context, environment) {
  const client = context.getTwilioClient();
  return client.serverless
    .services(environment.serviceSid)
    .environments(environment.sid)
    .variables.list();
}

async function getEnvironmentVariable(context, environment, key) {
  // The list filter method isn't implemented yet.
  const envVars = await getEnvironmentVariables(context, environment);
  return envVars.find((variable) => variable.key === key);
}

async function setEnvironmentVariable(
  context,
  environment,
  key,
  value,
  override = true
) {
  const client = context.getTwilioClient();
  try {
    const currentVariable = await getEnvironmentVariable(
      context,
      environment,
      key
    );
    if (currentVariable) {
      if (currentVariable.value !== value) {
        if (override) {
          if (value === undefined) {
            console.log(`Removing ${key}...`);
            await currentVariable.remove();
          } else {
            console.log(`Updating ${key}...`);
            await currentVariable.update({ value });
          }
          return true;
        }
        console.log(
          `Not overriding existing variable '${key}' which is set to '${currentVariable.value}'`
        );
        return false;
      }
      console.warn(`Variable '${key}' was already set to '${value}'`);
      return false;
    }
    console.log(`Creating variable ${key}`);
    await client.serverless
      .services(environment.serviceSid)
      .environments(environment.sid)
      .variables.create({
        key,
        value,
      });
  } catch (err) {
    console.error(`Error creating '${key}' with '${value}': ${err}`);
    return false;
  }
  return true;
}

function urlForSiblingPage(newPage, ...paths) {
  const url = path.resolve(...paths);
  const parts = url.split('/');
  parts.pop();
  parts.push(newPage);
  return parts.join('/');
}

module.exports = {
  checkAuthorization,
  checkAdminPassword,
  createToken,
  getCurrentEnvironment,
  getEnvironmentVariables,
  getEnvironmentVariable,
  setEnvironmentVariable,
  urlForSiblingPage,
};
