/* eslint-disable camelcase, complexity, sonarjs/cognitive-complexity */
/*
 * --------------------------------------------------------------------------------
 * common helper function used by functions & client-side javascript
 *
 * getParam(context, key)
 * getParam(context, key)
 * setParam(context, key, value)
 *
 * include via:
 *   const path = Runtime.getFunctions()['helper'].path;
 *   const { getParam, setParam } = require(path);
 * and call functions directly
 *
 *
 * --------------------------------------------------------------------------------
 */

/*
 * --------------------------------------------------------------------------------
 * sets environment variable
 * --------------------------------------------------------------------------------
 */
const AWS = require("aws-sdk");

async function setParam(context, key, value) {
  const Twilio = require('twilio');

  const onLocalhost = Boolean(
    context.DOMAIN_NAME && context.DOMAIN_NAME.startsWith('localhost')
  );
  console.debug('Runtime environment is localhost:', onLocalhost);

  const client = context.getTwilioClient();
  console.log('twilioClient', client);
  // eslint-disable-next-line no-use-before-define
  const service_sid = await getParam(context, 'TWILIO_SERVICE_SID');
  console.log('service_sid', service_sid);
  // eslint-disable-next-line no-use-before-define
  const environment_sid = await getParam(context, 'TWILIO_ENVIRONMENT_SID');
  console.log('environment_sid', environment_sid);

  let variable_sid = null;
  await client.serverless
    .services(service_sid)
    .environments(environment_sid)
    .variables.list()
    .then((variables) =>
      variables.forEach((v) => {
        if (v.key === key) variable_sid = v.sid;
      })
    );

  if (variable_sid === null) {
    await client.serverless
      .services(service_sid)
      .environments(environment_sid)
      .variables.create({ key, value })
      .then((v) => console.log('Created variable', v.key));
  } else {
    await client.serverless
      .services(service_sid)
      .environments(environment_sid)
      .variables(variable_sid)
      .update({ value })
      .then((v) => console.log('Updated variable', v.key));
  }
  console.log('Assigned', key, '=', value);
}

/*
 * --------------------------------------------------------------------------------
 * retrieve environment variable from
 * - service environment (aka context)
 * - os for local development (via os.process)
 * - per resource-specific logic
 *   . TWILIO_SERVICE_SID from context, otherwise matching application name
 *   . TWILIO_ENVIRONMENT_SID from TWILIO_SERVICE_SID
 *   . TWILIO_ENVIRONMENT_DOMAIN_NAME from TWILIO_SERVICE_SID
 * --------------------------------------------------------------------------------
 */
async function getParam(context, key) {
  const THIS_APPLICATION_NAME = 'patient-appointment-management';
  const CONSTANTS = {
    APPLICATION_NAME: THIS_APPLICATION_NAME,
    FILENAME_APPOINTMENT:
      'appointment{appointment_id}-patient{patient_id}.json',
    _S3_BUCKET_BASE: `twilio-${THIS_APPLICATION_NAME}`,
    _CF_STACK_DEPLOYER_BASE: `twilio-${THIS_APPLICATION_NAME}-deployer`,
    _CF_STACK_BUCKET_BASE: `twilio-${THIS_APPLICATION_NAME}-bucket`,
    _CF_STACK_APPLICATION_BASE: `twilio-${THIS_APPLICATION_NAME}-application`,
    _SEND_REMINDERS_BASE: 'twilio-send-appointment-reminders',
    _QUERY_STATE_BASE: 'twilio-query-appointment-state',
    _QUERY_HISTORY_BASE: 'twilio-query-appointment-history',
    _GLUE_CRAWLER_BASE: `twilio-${THIS_APPLICATION_NAME}`,
    _GLUE_DATABASE_BASE: 'patient_appointments',
  };

  // first return context non-null context value
  if (context[key]) return context[key];

  // second return CONSTANTS value
  if (CONSTANTS[key]) {
    context[key] = CONSTANTS[key];
    return context[key];
  }

  const account_sid = context.ACCOUNT_SID
    ? context.ACCOUNT_SID
    : process.env.ACCOUNT_SID;
  const auth_token = context.AUTH_TOKEN
    ? context.AUTH_TOKEN
    : process.env.AUTH_TOKEN;
  const client = context.getTwilioClient();

  const AWS = require('aws-sdk');
  const options = {
    accessKeyId: context.DEPLOYER_AWS_ACCESS_KEY_ID,
    secretAccessKey: context.DEPLOYER_AWS_SECRET_ACCESS_KEY,
    region: context.AWS_REGION,
  };
  const CF = new AWS.CloudFormation(options);
  // ---------- get CloudFormation Stack Outputs value
  async function getCFOutputs(stack, key) {
    try {
      const response = await CF.describeStacks({ StackName: stack }).promise();
      const output = response.Stacks[0].Outputs.find(function (o) {
        // Note that CF Output key MUST match that in the CF template
        return o.OutputKey === key;
      });
      return output === null ? null : output.OutputValue;
    } catch (AmazonCloudFormationException) {
      return null; // stack does not exist yet
    }
  }
  // ----------------------------------------------------------------------

  switch (key) {
    case 'DEPLOYER_AWS_ROLE_ARN': {
      const stack = await getParam(context, 'AWS_CF_STACK_DEPLOYER');
      return await getCFOutputs(stack, 'PatientAppointmentManagementDeployerRoleArn');
    }
    case 'AWS_ACCESS_KEY_ID': {
      const stack = await getParam(context, 'AWS_CF_STACK_APPLICATION');
      const secretArn = await getCFOutputs(stack, 'PatientAppointmentManagementSecretAWSArn');
      try {
        const SM = new AWS.SecretsManager({ region: context.AWS_REGION });
        const data = await SM.getSecretValue({SecretId: secretArn}).promise();
        const secret = JSON.parse(data.SecretString);
        return secret.AWS_ACCESS_KEY_ID;
      } catch (err) {
        return null;
      }
    }
    case 'AWS_SECRET_ACCESS_KEY': {
      const stack = await getParam(context, 'AWS_CF_STACK_APPLICATION');
      const secretArn = await getCFOutputs(stack, 'PatientAppointmentManagementSecretAWSArn');
      try {
        const SM = new AWS.SecretsManager({ region: context.AWS_REGION });
        const data = await SM.getSecretValue({SecretId: secretArn}).promise();
        const secret = JSON.parse(data.SecretString);
        return secret.AWS_SECRET_ACCESS_KEY;
      } catch (err) {
        return null;
      }
    }
    case 'AWS_ATHENA_WORKGROUP': {
      const stack = await getParam(context, 'AWS_CF_STACK_APPLICATION');
      return await getCFOutputs(stack, 'PatientAppointmentManagementAthenaWorkGroup');
    }
    case 'AWS_CF_STACK_APPLICATION': {
      const CUSTOMER_CODE = await getParam(context, 'CUSTOMER_CODE');
      return `${CONSTANTS._CF_STACK_APPLICATION_BASE}-${CUSTOMER_CODE}`;
    }
    case 'AWS_CF_STACK_BUCKET': {
      const CUSTOMER_CODE = await getParam(context, 'CUSTOMER_CODE');
      return `${CONSTANTS._CF_STACK_BUCKET_BASE}-${CUSTOMER_CODE}`;
    }
    case 'AWS_CF_STACK_DEPLOYER': {
      return `${CONSTANTS._CF_STACK_DEPLOYER_BASE}`;
    }
    case 'AWS_GLUE_CRAWLER': {
      const stack = await getParam(context, 'AWS_CF_STACK_APPLICATION');
      return await getCFOutputs(stack, 'PatientAppointmentManagementCrawlerAppointments');
    }
    case 'AWS_GLUE_DATABASE': {
      // TODO: change to fetch from crawler data
      return [
        CONSTANTS._GLUE_DATABASE_BASE,
        await getParam(context, 'CUSTOMER_CODE'),
      ].join('_');
    }
    case 'AWS_LAMBDA_SEND_REMINDERS': {
      const stack = await getParam(context, 'AWS_CF_STACK_APPLICATION');
      return await getCFOutputs(stack, 'PatientAppointmentManagementLambdaSendReminders');
    }
    case 'AWS_LAMBDA_QUERY_STATE': {
      const stack = await getParam(context, 'AWS_CF_STACK_APPLICATION');
      return await getCFOutputs(stack, 'PatientAppointmentManagementLambdaQueryState');
    }
    case 'AWS_LAMBDA_QUERY_HISTORY': {
      const stack = await getParam(context, 'AWS_CF_STACK_APPLICATION');
      return await getCFOutputs(stack, 'PatientAppointmentManagementLambdaQueryHistory');
    }
    case 'AWS_S3_BUCKET': {
      // TODO: change to fetch from stack
      const CUSTOMER_CODE = await getParam(context, 'CUSTOMER_CODE');
      return `${CONSTANTS._S3_BUCKET_BASE}-${CUSTOMER_CODE}`;
    }
    case 'AWS_SECRET_AWS_ARN': {
      const stack = await getParam(context, 'AWS_CF_STACK_APPLICATION');
      return await getCFOutputs(stack, 'PatientAppointmentManagementSecretAWSArn');
    }
    case 'AWS_SECRET_TWILIO_ARN': {
      const stack = await getParam(context, 'AWS_CF_STACK_APPLICATION');
      return await getCFOutputs(stack, 'PatientAppointmentManagementSecretTwilioArn');
    }
    case 'AWS_SFN_QUERY_STATE': {
      const stack = await getParam(context, 'AWS_CF_STACK_APPLICATION');
      return await getCFOutputs(stack, 'PatientAppointmentManagementStepFunctionQueryState');
    }
    case 'AWS_SFN_QUERY_HISTORY': {
      const stack = await getParam(context, 'AWS_CF_STACK_APPLICATION');
      return await getCFOutputs(stack, 'PatientAppointmentManagementStepFunctionQueryHistory');
    }
    case 'TWILIO_ACCOUNT_SID': {
      return getParam(context, 'ACCOUNT_SID');
    }
    case 'TWILIO_AUTH_TOKEN': {
      return getParam(context, 'AUTH_TOKEN');
    }
    case 'TWILIO_ENVIRONMENT_SID': {
      const service_sid = await getParam(context, 'TWILIO_SERVICE_SID');
      if (service_sid === null) {
        return null; // service not yet deployed
      }
      const environments = await client.serverless
        .services(service_sid)
        .environments.list();
      return environments[0].sid;
    }
    case 'TWILIO_ENVIRONMENT_DOMAIN_NAME': {
      const service_sid = await getParam(context, 'TWILIO_SERVICE_SID');
      if (service_sid === null) {
        return null; // service not yet deployed
      }
      const environments = await client.serverless
        .services(service_sid)
        .environments.list();
      return environments[0].domainName;
    }
    case 'TWILIO_FLOW_SID': {
      let flow_sid = null;
      await client.studio.flows.list({ limit: 100 }).then((flows) =>
        flows.forEach((f) => {
          if (f.friendlyName === THIS_APPLICATION_NAME) {
            flow_sid = f.sid;
          }
        })
      );
      if (flow_sid !== null) {
        /*
         * do not save in case flow is manually deleted
         * await setParam(context,'TWILIO_FLOW_SID', flow_sid);
         */
        return flow_sid;
      }
      return null;
    }
    case 'TWILIO_SERVICE_SID': {
      let service_sid = null;
      await client.serverless.services.list({ limit: 100 }).then((services) =>
        services.forEach((s) => {
          if (s.friendlyName === THIS_APPLICATION_NAME) {
            service_sid = s.sid;
          }
        })
      );
      if (service_sid !== null) {
        return service_sid;
      }
      console.log(
        'Developer note: YOU MUST DEPLOY THE SERVICE FIRST!!! ABORTING!!!'
      );
      return null;
    }
    default:
      throw new Error(`Undefined variable ${key} !!!`);
  }
}

module.exports = {
  getParam,
  setParam,
};
