const THIS = 'deployment/check:';
// --------------------------------------------------------------------------------
// function description
//
// event:
// . action = DELETE, optional
// --------------------------------------------------------------------------------
const aws    = require('aws-sdk');
const path   = Runtime.getFunctions()['helpers'].path;
const { retrieveParameter, assignParameter } = require(path);

exports.handler = async function(context, event, callback) {
  console.log(THIS, 'Starting');
  console.time(THIS);
  try {

    let parameters = null;
    if (event.hasOwnProperty('name') && event.name != undefined)
    {
      const value = await retrieveParameter(context, event.name);

      callback(null, value);
    }
    else {
      const parameters = {
        'APPLICATION_NAME': await retrieveParameter(context, 'APPLICATION_NAME'),
        'APPLICATION_CUSTOMER_CODE': await retrieveParameter(context, 'APPLICATION_CUSTOMER_CODE'),
        'APPLICATION_CUSTOMER_NAME': await retrieveParameter(context, 'APPLICATION_CUSTOMER_NAME'),
        'APPLICATION_FILENAME_PATTERN_OUTREACH': await retrieveParameter(context, 'APPLICATION_FILENAME_PATTERN_OUTREACH'),
        'APPLICATION_FILENAME_PATTERN_QUEUE': await retrieveParameter(context, 'APPLICATION_FILENAME_PATTERN_QUEUE'),
        'APPLICATION_FILENAME_PATTERN_RESPONSE': await retrieveParameter(context, 'APPLICATION_FILENAME_PATTERN_RESPONSE'),
        'AWS_DEPLOYER_AWS_ACCESS_KEY_ID': await retrieveParameter(context, 'AWS_DEPLOYER_AWS_ACCESS_KEY_ID'),
        'AWS_DEPLOYER_AWS_SECRET_ACCESS_KEY': await retrieveParameter(context, 'AWS_DEPLOYER_AWS_SECRET_ACCESS_KEY'),
        'AWS_ACCESS_KEY_ID': await retrieveParameter(context, 'AWS_ACCESS_KEY_ID'),
        'AWS_SECRET_ACCESS_KEY': await retrieveParameter(context, 'AWS_SECRET_ACCESS_KEY'),
        'AWS_REGION': await retrieveParameter(context, 'AWS_REGION'),
        'AWS_CF_STACK_APPLICATION': await retrieveParameter(context, 'AWS_CF_STACK_APPLICATION'),
        'AWS_CF_STACK_BUCKET': await retrieveParameter(context, 'AWS_CF_STACK_BUCKET'),
        'AWS_GLUE_CRAWLER': await retrieveParameter(context, 'AWS_GLUE_CRAWLER'),
        'AWS_GLUE_DATABASE': await retrieveParameter(context, 'AWS_GLUE_DATABASE'),
        'AWS_LAMBDA_SEND_OUTREACH': await retrieveParameter(context, 'AWS_LAMBDA_SEND_OUTREACH'),
        'AWS_S3_BUCKET': await retrieveParameter(context, 'AWS_S3_BUCKET'),
        'ACCOUNT_SID': await retrieveParameter(context, 'ACCOUNT_SID'),
        'AUTH_TOKEN': await retrieveParameter(context, 'AUTH_TOKEN'),
        'TWILIO_ACCOUNT_SID': await retrieveParameter(context, 'TWILIO_ACCOUNT_SID'),
        'TWILIO_AUTH_TOKEN': await retrieveParameter(context, 'TWILIO_AUTH_TOKEN'),
        'TWILIO_ENVIRONMENT_SID': await retrieveParameter(context, 'TWILIO_ENVIRONMENT_SID'),
        'TWILIO_ENVIRONMENT_DOMAIN_NAME': await retrieveParameter(context, 'TWILIO_ENVIRONMENT_DOMAIN_NAME'),
        'TWILIO_FLOW_SID': await retrieveParameter(context, 'TWILIO_FLOW_SID'),
        'TWILIO_SERVICE_SID': await retrieveParameter(context, 'TWILIO_SERVICE_SID'),
        'TWILIO_PHONE_NUMBER': await retrieveParameter(context, 'TWILIO_PHONE_NUMBER')
      };

      console.log(THIS, 'Note that some environment variables are null until the component is deployed');
      console.log(THIS, parameters);

      callback(null, parameters);
    }

  } finally {
    console.timeEnd(THIS);
  }
};
