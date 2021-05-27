const THIS = 'deployment/deploy-aws-application';
// --------------------------------------------------------------------------------
// function description
//
// event:
// . action = DELETE, optional
// --------------------------------------------------------------------------------
const assert = require('assert');
const fs     = require('fs');
const aws    = require('aws-sdk');
const path   = Runtime.getFunctions()['helpers'].path;
const { retrieveParameter, assignParameter } = require(path);

exports.handler = async function(context, event, callback) {
  console.log('Starting:', THIS);
  console.time(THIS);
  try {

  const CUSTOMER_CODE                    = await retrieveParameter(context, 'CUSTOMER_CODE');
  const APPOINTMENTS_S3_BUCKET           = await retrieveParameter(context, 'APPOINTMENTS_S3_BUCKET');
  const DEPLOYER_AWS_ACCESS_KEY_ID       = await retrieveParameter(context, 'DEPLOYER_AWS_ACCESS_KEY_ID');
  const DEPLOYER_AWS_SECRET_ACCESS_KEY   = await retrieveParameter(context, 'DEPLOYER_AWS_SECRET_ACCESS_KEY');
  const AWS_REGION                       = await retrieveParameter(context, 'AWS_REGION');
  const ACCOUNT_SID                      = await retrieveParameter(context, 'ACCOUNT_SID');
  const AUTH_TOKEN                       = await retrieveParameter(context, 'AUTH_TOKEN');
  const TWILIO_FLOW_SID                  = await retrieveParameter(context, 'FLOW_SID');
  const TWILIO_PHONE_NUMBER              = await retrieveParameter(context, 'TWILIO_PHONE_NUMBER');
  const LAMBDA_SEND_REMINDERS            = await retrieveParameter(context, 'LAMBDA_SEND_REMINDERS');
  const APPOINTMENT_FILENAME_PATTERN     = await retrieveParameter(context, 'APPOINTMENT_FILENAME_PATTERN');
  const CLOUDFORMATION_BUCKET_STACK      = await retrieveParameter(context, 'CLOUDFORMATION_BUCKET_STACK');
  const CLOUDFORMATION_APPLICATION_STACK = await retrieveParameter(context, 'CLOUDFORMATION_APPLICATION_STACK');
  const REMINDER_OUTREACH_START          = await retrieveParameter(context, 'REMINDER_OUTREACH_START');
  const REMINDER_OUTREACH_FINISH         = await retrieveParameter(context, 'REMINDER_OUTREACH_FINISH');
  const REMINDER_FIRST_OFFSET            = await retrieveParameter(context, 'REMINDER_FIRST_OFFSET');
  const REMINDER_SECOND_OFFSET           = await retrieveParameter(context, 'REMINDER_SECOND_OFFSET');

  const assets = Runtime.getAssets();
  const CF_TEMPLATE_PATH = assets['/aws/twilio-appointments-application.yml'].path;

  // ---------- get aws clients
  const options = {
      accessKeyId: DEPLOYER_AWS_ACCESS_KEY_ID,
      secretAccessKey: DEPLOYER_AWS_SECRET_ACCESS_KEY,
      region: AWS_REGION
  };
  const cf = new aws.CloudFormation(options);
  const s3 = new aws.S3(options);

  // ---------- look for dependent stack
  try {
    await cf.describeStacks({ StackName: CLOUDFORMATION_BUCKET_STACK }).promise();
  } catch (AmazonCloudFormationException) {
    throw new Error('no dependent ' + CLOUDFORMATION_BUCKET_STACK + ' stack!');
  }

  // ---------- look for stack
  let action = null;
  try {
      await cf.describeStacks({ StackName: CLOUDFORMATION_APPLICATION_STACK }).promise();
      if (event.hasOwnProperty('action') && event.action === 'DELETE') {
        action = 'DELETE';
      } else {
        action = 'UPDATE';
      }
  } catch (AmazonCloudFormationException) {
      action = 'CREATE';
  }

  // ---------- read & validate CF template
  const definition = fs.readFileSync(CF_TEMPLATE_PATH);
  console.log('Validating', CLOUDFORMATION_APPLICATION_STACK, 'CloudFormation Stack...');
  let response = await cf.validateTemplate({ TemplateBody: `${definition}` }).promise();

  switch (action) {

    case 'UPDATE':
    {
      console.log('Updating', CLOUDFORMATION_APPLICATION_STACK, 'CloudFormation Stack ...');
      try {
       let params = {
          StackName: CLOUDFORMATION_APPLICATION_STACK,
          TemplateBody: `${definition}`,
          Parameters: [
            { ParameterKey: 'ParamCustomerCode', UsePreviousValue: true},
            { ParameterKey: 'ParamAppointmentsS3BucketName', UsePreviousValue: true},
            { ParameterKey: 'ParamTwilioAccountSID', UsePreviousValue: true },
            { ParameterKey: 'ParamTwilioAuthToken', UsePreviousValue: true },
            { ParameterKey: 'ParamTwilioFlowSID', UsePreviousValue: true },
            { ParameterKey: 'ParamTwilioPhoneNumber', UsePreviousValue: true },
            { ParameterKey: 'ParamLambdaFunctionName', UsePreviousValue: true },
            { ParameterKey: 'ParamAppointmentFilenamePattern', UsePreviousValue: true },
            { ParameterKey: 'ParamReminderOutreachStart', UsePreviousValue: true },
            { ParameterKey: 'ParamReminderOutreachFinish', UsePreviousValue: true },
            { ParameterKey: 'ParamReminderFirstOffset', UsePreviousValue: true },
            { ParameterKey: 'ParamReminderSecondOffset', UsePreviousValue: true }
          ],
          Capabilities: ['CAPABILITY_IAM', 'CAPABILITY_NAMED_IAM', 'CAPABILITY_AUTO_EXPAND']
        }
        response = await cf.updateStack(params).promise();
        console.log('Successfully initiated stack update')
        callback(null, response);
      } catch (err) {
        if (err.message.includes('No updates are to be performed')) {
          console.log('No update stack needed as no change')
        } else {
          throw err;
        }
      }
    }
    break;

    case 'CREATE':
    {
      console.log('Creating', CLOUDFORMATION_APPLICATION_STACK, 'CloudFormation Stack...');
      let params = {
        StackName: CLOUDFORMATION_APPLICATION_STACK,
        TemplateBody: `${definition}`,
        Parameters: [
          { ParameterKey: 'ParamCustomerCode', ParameterValue: CUSTOMER_CODE},
          { ParameterKey: 'ParamAppointmentsS3BucketName', ParameterValue: APPOINTMENTS_S3_BUCKET},
          { ParameterKey: 'ParamTwilioAccountSID', ParameterValue: ACCOUNT_SID },
          { ParameterKey: 'ParamTwilioAuthToken', ParameterValue: AUTH_TOKEN },
          { ParameterKey: 'ParamTwilioFlowSID', ParameterValue: TWILIO_FLOW_SID },
          { ParameterKey: 'ParamTwilioPhoneNumber', ParameterValue: TWILIO_PHONE_NUMBER },
          { ParameterKey: 'ParamLambdaFunctionName', ParameterValue: LAMBDA_SEND_REMINDERS },
          { ParameterKey: 'ParamAppointmentFilenamePattern', ParameterValue: APPOINTMENT_FILENAME_PATTERN },
          { ParameterKey: 'ParamReminderOutreachStart', ParameterValue: REMINDER_OUTREACH_START },
          { ParameterKey: 'ParamReminderOutreachFinish', ParameterValue: REMINDER_OUTREACH_FINISH },
          { ParameterKey: 'ParamReminderFirstOffset', ParameterValue: REMINDER_FIRST_OFFSET },
          { ParameterKey: 'ParamReminderSecondOffset', ParameterValue: REMINDER_SECOND_OFFSET }
        ],
        OnFailure: 'ROLLBACK',
        Capabilities: ['CAPABILITY_IAM', 'CAPABILITY_NAMED_IAM', 'CAPABILITY_AUTO_EXPAND']
      }
      response = await cf.createStack(params).promise();
      console.log('Successfully initiated stack creation')
      callback(null, response);
    }
    break;

    case 'DELETE':
    {
      console.log('Deleting', CLOUDFORMATION_APPLICATION_STACK, 'CloudFormation Stack...');
      let params = {
        StackName: CLOUDFORMATION_APPLICATION_STACK
      }
      response = await cf.deleteStack(params).promise();
      console.log('Successfully initiated stack deletion')
      callback(null, response);
    }
    break;

    default:
      callback('undefined action!');
  }

  } finally {
    console.timeEnd(THIS);
  }
};
