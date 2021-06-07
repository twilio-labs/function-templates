// --------------------------------------------------------------------------------
// common helper function used by functions & client-side javascript
//
// retrieveParameter(context, key)
// assignParameter(context, key, value)
//
// include via:
//   const path = Runtime.getFunctions()['helper'].path;
//   const { retrieveParameter, assignParameter } = require(path);
// and call functions directly
//
//
// --------------------------------------------------------------------------------
const aws = require('aws-sdk');

const APPLICATION_NAME = 'patient-appointment-management';
const CONSTANTS = {
  'APPLICATION_NAME': APPLICATION_NAME,
  'APPLICATION_FILENAME_PATTERN_APPOINTMENT': 'appointment{appointment_id}-patient{patient_id}.json',
  'AWS_S3_BUCKET_BASE_NAME': `twilio-${APPLICATION_NAME}`,
  'AWS_CF_BUCKET_STACK_BASE_NAME': `twilio-${APPLICATION_NAME}-bucket`,
  'AWS_CF_APPLICATION_STACK_BASE_NAME': `twilio-${APPLICATION_NAME}-application`,
  'AWS_LAMBDA_SEND_REMINDERS': 'twilio-send-appointment-reminders',
  'AWS_GLUE_CRAWLER_BASE_NAME': `twilio-${APPLICATION_NAME}`,
  'AWS_GLUE_DATABASE': 'patient_appointments',
};

// --------------------------------------------------------------------------------
//
// --------------------------------------------------------------------------------
async function assignParameter(context, key, value) {
  const onLocalhost = (context.DOMAIN_NAME && context.DOMAIN_NAME.startsWith('localhost')) ? true : false;
  console.debug('Runtime environment is localhost:', onLocalhost);

  if (onLocalhost)
  {
    process.env[key] = value;
  }
  else
  {
    const client = context.getTwilioClient();
    const service_sid = await retrieveParameter(context, 'TWILIO_SERVICE_SID');
    const environment_sid = await retrieveParameter(contenxt, 'TWILIO_ENVIRONMENT_SID');

    let variable_sid = null;
    await client.serverless
      .services(service_sid)
      .environments(environment_sid)
      .variables
      .list()
      .then(
        variables => variables.forEach(v => {
            if (v.key == key) variable_sid = v.sid;
          })
      );

    if (variable_sid != null) {
      await client.serverless
        .services(service_sid)
        .environments(environment_sid)
        .variables(variable_sid)
        .update({ value: value })
        .then(v => console.log('Updated variable', v.key));
    } else {
      await client.serverless
        .services(service_sid)
        .environments(environment_sid)
        .variables
        .create({ key: key, value: value })
        .then(v => console.log('Created variable', v.key));
    }
  }
  console.log('Assigned', key, '=', value);
}

// --------------------------------------------------------------------------------
// retrieve environment variable from
// - service environment (aka context)
// - os for local development (via os.process)
// - per resource-specific logic
//   . TWILIO_SERVICE_SID from context, otherwise matching application name
//   . TWILIO_ENVIRONMENT_SID from TWILIO_SERVICE_SID
//   . TWILIO_ENVIRONMENT_DOMAIN_NAME from TWILIO_SERVICE_SID
// --------------------------------------------------------------------------------
async function retrieveParameter(context, key) {
  if (context[key] != undefined
   && context[key] != null
   && context[key] != '')
  {
    // if key is available in context, return it 1st
    return context[key];
  }

  if (CONSTANTS[key] != undefined
    && CONSTANTS[key] != null
    && CONSTANTS[key] != '')
  {
    // if key is available in CONSTANTS, return it 2nd
    return CONSTANTS[key];
  }

  const account_sid = context.ACCOUNT_SID ? context.ACCOUNT_SID: process.env.ACCOUNT_SID;
  const auth_token  = context.AUTH_TOKEN  ? context.AUTH_TOKEN: process.env.AUTH_TOKEN;
  const onLocalhost = (context.DOMAIN_NAME && context.DOMAIN_NAME.startsWith('localhost')) ? true : false;
  const client = (onLocalhost) ? require('twilio')(account_sid, auth_token) : context.getTwilioClient();

  switch (key)
  {
    case 'AWS_S3_BUCKET':
    {
      const APPLICATION_CUSTOMER_CODE = await retrieveParameter(context, 'APPLICATION_CUSTOMER_CODE');
      const bucket_name = CONSTANTS.AWS_S3_BUCKET_BASE_NAME + '-' + APPLICATION_CUSTOMER_CODE;
      await assignParameter(context,'AWS_S3_BUCKET', bucket_name);
      return bucket_name;
    }
    case 'AWS_ACCESS_KEY_ID':
    {
      // ---------- get aws clients
      const options = {
        accessKeyId: await retrieveParameter(context, 'DEPLOYER_AWS_ACCESS_KEY_ID'),
        secretAccessKey: await retrieveParameter(context, 'DEPLOYER_AWS_SECRET_ACCESS_KEY'),
        region: await retrieveParameter(context, 'AWS_REGION')
      };
      const cf = new aws.CloudFormation(options);

      try {
        const stack_name = await retrieveParameter(context, 'AWS_CF_STACK_APPLICATION');
        const response = await cf.describeStacks({StackName: stack_name}).promise();
        const output = response.Stacks[0].Outputs.find(function (o) {
          if (o.OutputKey === 'AWSAccessKeyId') return o;
        });
        await assignParameter(context, 'AWS_ACCESS_KEY_ID', output.OutputValue);
        return (output != null) ? output.OutputValue : null;
      } catch (AmazonCloudFormationException) {
        return null; // stack does not exist yet
      }
    }
    case 'AWS_SECRET_ACCESS_KEY':
    {
      // ---------- get aws clients
      const options = {
        accessKeyId: await retrieveParameter(context, 'DEPLOYER_AWS_ACCESS_KEY_ID'),
        secretAccessKey: await retrieveParameter(context, 'DEPLOYER_AWS_SECRET_ACCESS_KEY'),
        region: await retrieveParameter(context, 'AWS_REGION')
      };
      const cf = new aws.CloudFormation(options);

      try {
        const stack_name = await retrieveParameter(context, 'AWS_CF_STACK_APPLICATION');
        const response = await cf.describeStacks({StackName: stack_name}).promise();
        const output = response.Stacks[0].Outputs.find(function (o) {
          if (o.OutputKey === 'AWSSecretAccessKey') return o;
        });
        await assignParameter(context, 'AWS_SECRET_ACCESS_KEY', output.OutputValue);
        return (output != null) ? output.OutputValue : null;
      } catch (AmazonCloudFormationException) {
        return null; // stack does not exist yet
      }
    }
    case 'AWS_CF_STACK_APPLICATION':
    {
      const APPLICATION_CUSTOMER_CODE = await retrieveParameter(context, 'APPLICATION_CUSTOMER_CODE');
      const stack_name = CONSTANTS.AWS_CF_APPLICATION_STACK_BASE_NAME + '-' + APPLICATION_CUSTOMER_CODE;
      await assignParameter(context,'AWS_CF_STACK_APPLICATION', stack_name);
      return stack_name;
    }
    case 'AWS_CF_STACK_BUCKET':
    {
      const APPLICATION_CUSTOMER_CODE = await retrieveParameter(context, 'APPLICATION_CUSTOMER_CODE');
      const stack_name = CONSTANTS.AWS_CF_BUCKET_STACK_BASE_NAME + '-' + APPLICATION_CUSTOMER_CODE;
      await assignParameter(context,'AWS_CF_STACK_BUCKET', stack_name);
      return stack_name;
    }
    case 'TWILIO_ENVIRONMENT_SID':
    {
      const service_sid = await retrieveParameter(context, 'TWILIO_SERVICE_SID');
      if (service_sid == null) {
        return null; // service not yet deployed
      } else {
        const environments = await client.serverless
          .services(service_sid)
          .environments.list();
        console.debug(environments[0]);
        return environments[0].sid;
      }
    }
    case 'TWILIO_ENVIRONMENT_DOMAIN_NAME':
    {
      const service_sid = await retrieveParameter(context, 'TWILIO_SERVICE_SID');
      if (service_sid == null) {
        return null; // service not yet deployed
      } else {
        const environments = await client.serverless
          .services(service_sid)
          .environments.list();
        return environments[0].domainName;
      }
    }
    case 'TWILIO_FLOW_SID':
    {
      let flow_sid = null;
      await client.studio.flows
        .list({limit: 100})
        .then(flows => flows.forEach(f => {
          if (f.friendlyName === CONSTANTS.APPLICATION_NAME) {
            flow_sid = f.sid;
          }
        }));
      if (flow_sid != null) {
        // do not save in case flow is manually deleted
        // await assignParameter(context,'TWILIO_FLOW_SID', flow_sid);
        return flow_sid;
      } else {
        return null;
      }
    }
    case 'AWS_GLUE_CRAWLER':
    {
      const APPLICATION_CUSTOMER_CODE = await retrieveParameter(context, 'APPLICATION_CUSTOMER_CODE');
      const crawler_name = CONSTANTS.AWS_GLUE_CRAWLER_BASE_NAME + '-' + APPLICATION_CUSTOMER_CODE;
      return crawler_name;
    }
    case 'AWS_LAMBDA_SEND_REMINDERS':
    {
      const APPLICATION_CUSTOMER_CODE = await retrieveParameter(context, 'APPLICATION_CUSTOMER_CODE');
      const lambda_name = CONSTANTS.AWS_LAMBDA_SEND_REMINDERS + '-' + APPLICATION_CUSTOMER_CODE;
      await assignParameter(context,'AWS_LAMBDA_SEND_REMINDERS', lambda_name);
      return lambda_name;
    }
    case 'TWILIO_SERVICE_SID':
    {
      let service_sid = null;
      await client.serverless.services
        .list({limit: 100})
        .then(services => services.forEach(s => {
          if (s.friendlyName == CONSTANTS.APPLICATION_NAME) {
            service_sid = s.sid;
          }
        }));
      if (service_sid != null) {
        await assignParameter(context,'TWILIO_SERVICE_SID', service_sid);
        return service_sid;
      } else {
        console.log('YOU MUST DEPLOY THE SERVICE FIRST!!! ABORTING!!!');
        throw new Error('YOU MUST DEPLOY THE SERVICE FIRST!!!');
      }
    }
    default:
      return null;
  }
}

module.exports = {
  retrieveParameter,
  assignParameter
}
