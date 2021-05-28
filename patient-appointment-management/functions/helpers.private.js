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

const CONSTANTS = {
  'APPLICATION_NAME': 'patient-appointment-management',
  'S3_BUCKET_BASE_NAME': 'twilio-appointments',
  'CF_BUCKET_STACK_BASE_NAME': 'twilio-appointments-bucket',
  'CF_APPLICATION_STACK_BASE_NAME': 'twilio-appointments-application',
  'LAMBDA_SEND_REMINDERS_BASE_NAME': 'twilio-send-appointment-reminders',
  'GLUE_CRAWLER_BASE_NAME': 'twilio-appointments',
  'CODE_SEND_REMINDERS': '/aws/send_appointment_reminders.js',
  'APPOINTMENT_FILENAME_PATTERN': 'appointment{appointment_id}-patient{patient_id}.json'
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
    const service_sid = await retrieveParameter(context, 'SERVICE_SID');
    const environment_sid = await retrieveParameter(contenxt, 'ENVIRONMENT_SID');

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
//   . SERVICE_SID from context, otherwise matching application name
//   . ENVIRONMENT_SID from SERVICE_SID
//   . ENVIRONMENT_DOMAIN_NAME from SERVICE_SID
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
    case 'APPOINTMENTS_S3_BUCKET':
    {
      const CUSTOMER_CODE = await retrieveParameter(context, 'CUSTOMER_CODE');
      const bucket_name = CONSTANTS.S3_BUCKET_BASE_NAME + '-' + CUSTOMER_CODE;
      await assignParameter(context,'APPOINTMENTS_S3_BUCKET', bucket_name);
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
        const stack_name = await retrieveParameter(context, 'CLOUDFORMATION_APPLICATION_STACK');
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
        const stack_name = await retrieveParameter(context, 'CLOUDFORMATION_APPLICATION_STACK');
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
    case 'CLOUDFORMATION_APPLICATION_STACK':
    {
      const CUSTOMER_CODE = await retrieveParameter(context, 'CUSTOMER_CODE');
      const stack_name = CONSTANTS.CF_APPLICATION_STACK_BASE_NAME + '-' + CUSTOMER_CODE;
      await assignParameter(context,'CLOUDFORMATION_APPLICATION_STACK', stack_name);
      return stack_name;
    }
    case 'CLOUDFORMATION_BUCKET_STACK':
    {
      const CUSTOMER_CODE = await retrieveParameter(context, 'CUSTOMER_CODE');
      const stack_name = CONSTANTS.CF_BUCKET_STACK_BASE_NAME + '-' + CUSTOMER_CODE;
      await assignParameter(context,'CLOUDFORMATION_BUCKET_STACK', stack_name);
      return stack_name;
    }
    case 'ENVIRONMENT_SID':
    {
      const service_sid = await retrieveParameter(context, 'SERVICE_SID');
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
    case 'ENVIRONMENT_DOMAIN_NAME':
    {
      const service_sid = await retrieveParameter(context, 'SERVICE_SID');
      if (service_sid == null) {
        return null; // service not yet deployed
      } else {
        const environments = await client.serverless
          .services(service_sid)
          .environments.list();
        return environments[0].domainName;
      }
    }
    case 'FLOW_SID':
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
        // await assignParameter(context,'FLOW_SID', flow_sid);
        return flow_sid;
      } else {
        return null;
      }
    }
    case 'GLUE_CRAWLER':
    {
      const CUSTOMER_CODE = await retrieveParameter(context, 'CUSTOMER_CODE');
      const crawler_name = CONSTANTS.GLUE_CRAWLER_BASE_NAME + '-' + CUSTOMER_CODE;
      await assignParameter(context,'GLUE_CRAWLER', crawler_name);
      return crawler_name;
    }
    case 'LAMBDA_SEND_REMINDERS':
    {
      const CUSTOMER_CODE = await retrieveParameter(context, 'CUSTOMER_CODE');
      const lambda_name = CONSTANTS.LAMBDA_SEND_REMINDERS_BASE_NAME + '-' + CUSTOMER_CODE;
      await assignParameter(context,'LAMBDA_SEND_REMINDERS', lambda_name);
      return lambda_name;
    }
    case 'SERVICE_SID':
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
        await assignParameter(context,'SERVICE_SID', service_sid);
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
