async function getEnvironmentVariables(context, environment) {
  const client = context.getTwilioClient();
  // eslint-disable-next-line prettier/prettier, no-return-await
  return await client.serverless
    .services(environment.serviceSid)
    .environments(environment.sid)
    .variables.list();
}

async function getEnvironmentVariable(context, environment, key) {
  // The list filter method isn't implemented yet.
  const envVars = await getEnvironmentVariables(context, environment);
  return envVars.find((variable) => variable.key === key);
}

// eslint-disable-next-line consistent-return
async function getCurrentEnvironment(context) {
  if (!context.DOMAIN_NAME) {
    throw new Error('DOMAIN_NAME environment variable must be set.');
  }

  if (context.DOMAIN_NAME.startsWith('localhost')) {
    throw new Error(
      'Cannot save environment variables on local environment: edit your .env file and restart.'
    );
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
      return environment;
    }
  }
}

async function setEnvironmentVariable(
  context,
  environment,
  key,
  value,
  override = true
) {
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
    const client = context.getTwilioClient();
    await client.serverless
      .services(environment.serviceSid)
      .environments(environment.sid)
      .variables.create({
        key,
        value,
      })
      .catch((err) => {
        console.log(err);
      });
  } catch (err) {
    console.log(err);
    return false;
  }
  return true;
}

function getBaseUrl(context) {
  if (!context.DOMAIN_NAME) {
    throw new Error('DOMAIN_NAME environment variable must be set.');
  }
  if (context.DOMAIN_NAME.startsWith('localhost')) {
    return `http://${context.DOMAIN_NAME}`;
  }

  return `https://${context.DOMAIN_NAME}`;
}

// This function only returns public settings, private variables are redacted.
function redactVariable(envVar) {
  let redactedVariable = '';

  if (envVar) {
    redactedVariable = envVar
      .split('')
      .map(() => {
        return '•';
      })
      .join('');
  }

  return redactedVariable;
}

function segmentTrack(params, context) {
  const Analytics = require('analytics-node');
  const analytics = new Analytics(context.SEGMENT_WRITE_KEY);

  return new Promise((resolve, reject) => {
    analytics.track(params, (err, res) => {
      if (err) {
        reject(err);
      } else {
        resolve(res);
      }
    });
  });
}

async function segmentOptIn(twiml, optin, context, event, callback) {
  // eslint-disable-next-line prefer-const
  let segmentData = {
    userId: event.From,
    event: 'SMS Opt-In Confirmed',
    properties: {
      phoneNumber: event.From,
      optInStatus: 'inactive',
    },
  };

  let responseMessage = null;

  if (optin) {
    segmentData.properties.optInStatus = 'active';
    responseMessage = twiml;
  }

  await segmentTrack(segmentData, context);

  return callback(null, responseMessage);
}

function webhookOptIn(twiml, optin, context, event, callback) {
  const axios = require('axios');
  console.log('Webhook opt-in');
  axios({
    method: 'post',
    url: context.WEBHOOK_URL,
    data: {
      phoneNumber: event.From,
      optInStatus: optin ? 'active' : 'inactive',
    },
  })
    .then((result) => {
      callback(null, twiml);
    })
    .catch((err) => {
      callback(err);
    });
}

function initAirtableBase(context) {
  const Airtable = require('airtable');

  return new Airtable({ apiKey: context.AIRTABLE_API_KEY }).base(
    context.AIRTABLE_BASE_ID
  );
}

function airtableCreateOptIn(twiml, context, event, callback) {
  const base = initAirtableBase(context);
  const tableName = context.AIRTABLE_TABLE_NAME;
  const phoneColumnName = context.AIRTABLE_PHONE_COLUMN_NAME;
  const optInColumnName = context.AIRTABLE_OPT_IN_COLUMN_NAME;

  base(tableName)
    .select({
      maxRecords: 1,
      filterByFormula: `${phoneColumnName} = '${event.From}'`,
      view: 'Grid view',
    })
    .eachPage((records, fetchNextPage) => {
      if (records.length > 0) {
        records.forEach((record) => {
          base(tableName).update(
            [
              {
                id: record.getId(),
                fields: {
                  [optInColumnName]: true,
                },
              },
            ],
            (err, records) => {
              if (err) {
                console.error(err);
                return;
              }

              callback(null, twiml);
            }
          );
        });
      } else {
        base(tableName).create(
          [
            {
              fields: {
                [phoneColumnName]: event.From,
                [optInColumnName]: true,
              },
            },
          ],
          (err, records) => {
            if (err) {
              return callback(err);
            }

            return callback(null, twiml);
          }
        );
      }
    });
}

function airtableRemoveOptIn(context, event, callback) {
  const base = initAirtableBase(context);
  const tableName = context.AIRTABLE_TABLE_NAME;
  const phoneColumnName = context.AIRTABLE_PHONE_COLUMN_NAME;
  const optInColumnName = context.AIRTABLE_OPT_IN_COLUMN_NAME;

  base(tableName)
    .select({
      maxRecords: 1,
      filterByFormula: `${phoneColumnName} = '${event.From}'`,
      view: 'Grid view',
    })
    .eachPage(
      function page(records, fetchNextPage) {
        console.log('stopword', records);
        records.forEach((record) => {
          base(tableName).update(
            [
              {
                id: record.getId(),
                fields: {
                  [optInColumnName]: false,
                },
              },
            ],
            (err, records) => {
              if (err) {
                console.error(err);
                return;
              }
              callback(null, null);
            }
          );
        });
      },
      function done(err) {
        if (err) {
          console.error(err);
          return callback(err);
        }

        return callback(null, null);
      }
    );
}

module.exports = {
  getEnvironmentVariables,
  getEnvironmentVariable,
  getCurrentEnvironment,
  setEnvironmentVariable,
  getBaseUrl,
  redactVariable,
  segmentTrack,
  segmentOptIn,
  webhookOptIn,
  airtableCreateOptIn,
  airtableRemoveOptIn,
};
