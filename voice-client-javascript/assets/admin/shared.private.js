const crypto = require("crypto");
const path = require("path");

// Change the salt to invalidate tokens
const SALT = "salty";

// Creates a token for client side usage
function createToken(context, password) {
  const tokenString = `${context.ACCOUNT_SID}:${password}:${SALT}`;
  // Similar to TwilioClient
  return crypto
    .createHmac("sha1", context.AUTH_TOKEN)
    .update(Buffer.from(tokenString, "utf-8"))
    .digest("base64");
}

function isAllowed(context, token) {
  // Create the token with the environment password
  const masterToken = createToken(context, context.ADMIN_PASSWORD);
  return masterToken === token;
}

// Shortcuts by calling the callback with an error
function checkAuthorization(context, event, callback) {
  if (!isAllowed(context, event.token)) {
    const response = new Twilio.Response();
    response.setStatusCode(403);
    response.setBody("Not authorized");
    callback(null, response);
    return false;
  }
  return true;
}

async function usesFunctionUi(context) {
  const environment = getCurrentEnvironment(context);
  if (environment === undefined) {
    return false;
  }
  const client = context.getTwilioClient();
  const service = await client.serverless.services(environment.serviceSid).fetch();
  return service.uiEditable;
}

async function getCurrentEnvironment(context) {
  if (context.DOMAIN_NAME && context.DOMAIN_NAME.startsWith("localhost")) {
    return;
  }
  const client = context.getTwilioClient();
  const services = await client.serverless.services.list();
  for (let service of services) {
    const environments = await client.serverless
      .services(service.sid)
      .environments.list();
    const environment = environments.find(
      env => env.domainName === context.DOMAIN_NAME
    );
    if (environment) {
      // Exit the function
      return environment;
    }
  }
}

async function getEnvironmentVariables(context, environment) {
  const client = context.getTwilioClient();
  return await client.serverless
    .services(environment.serviceSid)
    .environments(environment.sid)
    .variables.list();
}

async function getEnvironmentVariable(context, environment, key) {
  // The list filter method isn't implemented yet.
  const envVars = await getEnvironmentVariables(context, environment);
  return envVars.find(variable => variable.key === key);
}

/**
 * 
 * @param {*} context Function Context
 * @param {*} environment Serverless Environment
 * @param {*} key Name of the variable
 * @param {*} value The value to set. Using `undefined` will unset/remove the variable
 * @param {*} override Should existing values be overridden. Default is true.
 * @returns 
 */

async function setEnvironmentVariable(context, environment, key, value, override=true) {
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
          // undefined is a special value that means to unset environment variables
          if (value === undefined) {
            console.log(`Removing ${key}...`);
            await currentVariable.remove();
          } else {
            console.log(`Updating ${key}...`);
            await currentVariable.update({ value });
          }
          return true;
        } else {
          console.log(`Not overriding existing variable '${key}' which is set to '${currentVariable.value}'`);
          return false;
        }
      } else {
        console.warn(`Variable '${key}' was already set to '${value}'`);
        return false;
      }
    } else {
      console.log(`Creating variable ${key}`);
      await client.serverless
        .services(environment.serviceSid)
        .environments(environment.sid)
        .variables.create({
          key,
          value
        });
    }
  } catch (err) {
    console.error(`Error creating '${key}' with '${value}': ${err}`);
    return false;
  }
  return true;
}

function urlForSiblingPage(newPage, ...paths) {
  const url = path.resolve(...paths);
  const parts = url.split("/");
  parts.pop();
  parts.push(newPage);
  return parts.join("/");
}

module.exports = {
  checkAuthorization,
  createToken,
  getCurrentEnvironment,
  getEnvironmentVariables,
  getEnvironmentVariable,
  setEnvironmentVariable,
  urlForSiblingPage,
  usesFunctionUi,
};
