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

  const APPLICATION_CUSTOMER_CODE                    = await retrieveParameter(context, 'APPLICATION_CUSTOMER_CODE');
  const AWS_S3_BUCKET           = await retrieveParameter(context, 'AWS_S3_BUCKET');
  const DEPLOYER_AWS_ACCESS_KEY_ID       = await retrieveParameter(context, 'DEPLOYER_AWS_ACCESS_KEY_ID');
  const DEPLOYER_AWS_SECRET_ACCESS_KEY   = await retrieveParameter(context, 'DEPLOYER_AWS_SECRET_ACCESS_KEY');
  const AWS_REGION                       = await retrieveParameter(context, 'AWS_REGION');
  const ACCOUNT_SID                      = await retrieveParameter(context, 'ACCOUNT_SID');
  const AUTH_TOKEN                       = await retrieveParameter(context, 'AUTH_TOKEN');
  const TWILIO_TWILIO_FLOW_SID                  = await retrieveParameter(context, 'TWILIO_FLOW_SID');
  const TWILIO_PHONE_NUMBER              = await retrieveParameter(context, 'TWILIO_PHONE_NUMBER');
  const AWS_LAMBDA_SEND_REMINDERS            = await retrieveParameter(context, 'AWS_LAMBDA_SEND_REMINDERS');
  const AWS_GLUE_CRAWLER                     = await retrieveParameter(context, 'AWS_GLUE_CRAWLER');
  const GLUE_DATABASE                    = await retrieveParameter(context, 'GLUE_DATABASE');
  const APPLICATION_FILENAME_PATTERN_APPOINTMENT     = await retrieveParameter(context, 'APPLICATION_FILENAME_PATTERN_APPOINTMENT');
  const AWS_CF_STACK_BUCKET      = await retrieveParameter(context, 'AWS_CF_STACK_BUCKET');
  const AWS_CF_STACK_APPLICATION = await retrieveParameter(context, 'AWS_CF_STACK_APPLICATION');
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
    await cf.describeStacks({ StackName: AWS_CF_STACK_BUCKET }).promise();
  } catch (AmazonCloudFormationException) {
    throw new Error('no dependent ' + AWS_CF_STACK_BUCKET + ' stack!');
  }

  // ---------- look for stack
  let action = null;
  try {
      await cf.describeStacks({ StackName: AWS_CF_STACK_APPLICATION }).promise();
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
  console.log('Validating', AWS_CF_STACK_APPLICATION, 'CloudFormation Stack...');
  let response = await cf.validateTemplate({ TemplateBody: `${definition}` }).promise();

  switch (action) {

    case 'UPDATE':
    {
      console.log('Updating', AWS_CF_STACK_APPLICATION, 'CloudFormation Stack ...');
      try {
       let params = {
          StackName: AWS_CF_STACK_APPLICATION,
          TemplateBody: `${definition}`,
          Parameters: [
            { ParameterKey: 'ParamCustomerCode', UsePreviousValue: true},
            { ParameterKey: 'ParamAppointmentsS3BucketName', UsePreviousValue: true},
            { ParameterKey: 'ParamTwilioAccountSID', UsePreviousValue: true },
            { ParameterKey: 'ParamTwilioAuthToken', UsePreviousValue: true },
            { ParameterKey: 'ParamTwilioFlowSID', UsePreviousValue: true },
            { ParameterKey: 'ParamTwilioPhoneNumber', UsePreviousValue: true },
            { ParameterKey: 'ParamLambdaFunctionName', UsePreviousValue: true },
            { ParameterKey: 'ParamGlueCrawlerName', UsePreviousValue: true },
            { ParameterKey: 'ParamGlueDatabaseName', UsePreviousValue: true },
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
      console.log('Creating', AWS_CF_STACK_APPLICATION, 'CloudFormation Stack...');
      let params = {
        StackName: AWS_CF_STACK_APPLICATION,
        TemplateBody: `${definition}`,
        Parameters: [
          { ParameterKey: 'ParamCustomerCode', ParameterValue: APPLICATION_CUSTOMER_CODE},
          { ParameterKey: 'ParamAppointmentsS3BucketName', ParameterValue: AWS_S3_BUCKET},
          { ParameterKey: 'ParamTwilioAccountSID', ParameterValue: ACCOUNT_SID },
          { ParameterKey: 'ParamTwilioAuthToken', ParameterValue: AUTH_TOKEN },
          { ParameterKey: 'ParamTwilioFlowSID', ParameterValue: TWILIO_TWILIO_FLOW_SID },
          { ParameterKey: 'ParamTwilioPhoneNumber', ParameterValue: TWILIO_PHONE_NUMBER },
          { ParameterKey: 'ParamLambdaFunctionName', ParameterValue: AWS_LAMBDA_SEND_REMINDERS },
          { ParameterKey: 'ParamGlueCrawlerName', ParameterValue: AWS_GLUE_CRAWLER },
          { ParameterKey: 'ParamAppointmentFilenamePattern', ParameterValue: APPLICATION_FILENAME_PATTERN_APPOINTMENT },
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
      console.log('Deleting', AWS_CF_STACK_APPLICATION, 'CloudFormation Stack...');
      let params = {
        StackName: AWS_CF_STACK_APPLICATION
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
