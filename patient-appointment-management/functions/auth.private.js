/* eslint-disable no-else-return,  no-negated-condition */
const crypto = require('crypto');
const jwt = require('jsonwebtoken');

const MFA_TOKEN_DURATION = 5 * 60;
const APP_TOKEN_DURATION = 30 * 60;

function checkDisableAuthForLocalhost(context) {
  return (
    context.DOMAIN_NAME &&
    context.DOMAIN_NAME.startsWith('localhost') &&
    context.DISABLE_AUTH_FOR_LOCALHOST &&
    context.DISABLE_AUTH_FOR_LOCALHOST === 'true'
  );
}

function isValidPassword(password, context) {
  return (
    checkDisableAuthForLocalhost(context) ||
    password === context.APPLICATION_PASSWORD
  );
}

function createAppToken(issuer, context) {
  return jwt.sign({}, context.AUTH_TOKEN, {
    expiresIn: APP_TOKEN_DURATION,
    audience: 'app',
    issuer,
    subject: 'administrator',
  });
}

function createMfaToken(issuer, context) {
  if (checkDisableAuthForLocalhost(context)) {
    return createAppToken(issuer, context);
  }

  return jwt.sign({}, context.AUTH_TOKEN, {
    expiresIn: MFA_TOKEN_DURATION,
    audience: 'mfa',
    issuer,
    subject: 'administrator',
  });
}

function isValidMfaToken(token, context) {
  try {
    return (
      checkDisableAuthForLocalhost(context) ||
      jwt.verify(token, context.AUTH_TOKEN, { audience: 'mfa' })
    );
  } catch (err) {
    return false;
  }
}

function isValidAppToken(token, context) {
  console.log('In check App token');
  try {
    return (
      checkDisableAuthForLocalhost(context) ||
      jwt.verify(token, context.AUTH_TOKEN, { audience: 'app' })
    );
  } catch (err) {
    console.log(err);
    return false;
  }
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
  createAppToken,
  createMfaToken,
  isValidAppToken,
  isValidMfaToken,
  isValidPassword,
  getCurrentEnvironment,
  getEnvironmentVariables,
  getEnvironmentVariable,
  setEnvironmentVariable,
};
