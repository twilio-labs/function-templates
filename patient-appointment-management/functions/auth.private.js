/* eslint-disable no-negated-condition, no-else-return */
const crypto = require('crypto');
var jwt = require('jsonwebtoken');

function createToken(password, context) {
  const tokenString = `${context.ACCOUNT_SID}:${password}:${context.SALT}`;

  return crypto
    .createHmac('sha1', context.AUTH_TOKEN)
    .update(Buffer.from(tokenString, 'utf-8'))
    .digest('base64');
}

function createPreMfaToken(mfaCode, context){

  mfaEncrypt= crypto
      .createHmac('sha256', context.AUTH_TOKEN)
      .update(Buffer.from(`${mfaCode}:${context.SALT}`, 'utf-8'))
      .digest('base64');

  var jwtToken = jwt.sign(
      { data: mfaEncrypt },
      context.AUTH_TOKEN,
      {expiresIn: 5 * 60, audience: "mfa", issuer: "login", subject: "administrator"});
  console.log("F");

  return jwtToken;
}

function isAllowed(token, context) {
  // Create the token with the environment password
  const masterToken = createToken(context.APPLICATION_PASSWORD, context);
  return masterToken === token;
}

async function getCurrentEnvironment(context) {
  if (context.DOMAIN_NAME && context.DOMAIN_NAME.startsWith('localhost')) {
    return null;
  }
  const client = context.getTwilioClient();
  const services = await client.serverless.services.list();
  for (service of services) {
    const environments = await client.serverless
      .services(service.sid)
      .environments.list();
    const environment = environments.find(
      (env) => env.domainName === context.DOMAIN_NAME
    );
    if (environment) {
      // Exit the function
      return environment;
    }
  }
  return null;
}

async function getEnvironmentVariables(context, environment) {
  const client = context.getTwilioClient();
  return client.serverless
    .services(environment.serviceSid)
    .environments(environment.sid)
    .variables.list();
}

async function getEnvironmentVariable(context, environment, key) {
  const client = context.getTwilioClient();
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
          console.log(`Updating ${key}...`);
          await currentVariable.update({ value });
          return true;
        } else {
          console.log(
            `Not overriding existing variable '${key}' which is set to '${currentVariable.value}'`
          );
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
          value,
        });
    }
  } catch (err) {
    console.error(`Error creating '${key}' with '${value}': ${err}`);
    return false;
  }
  return true;
}

module.exports = {
  createToken,
  isAllowed,
  createPreMfaToken,
  getCurrentEnvironment,
  getEnvironmentVariables,
  getEnvironmentVariable,
  setEnvironmentVariable,
};
