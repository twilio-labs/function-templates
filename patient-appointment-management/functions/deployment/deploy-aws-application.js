/* eslint-disable camelcase, dot-notation */
const THIS = 'deployment/deploy-aws-application';
/*
 * --------------------------------------------------------------------------------
 * function description
 *
 * event:
 * . action = DELETE, optional
 * --------------------------------------------------------------------------------
 */
const assert = require('assert');
const fs = require('fs');
const aws = require('aws-sdk');

const path0 = Runtime.getFunctions()['helpers'].path;
const { getParam, setParam } = require(path0);
const path1 = Runtime.getFunctions()['auth'].path;
const { isValidAppToken } = require(path1);

exports.handler = async function (context, event, callback) {
  console.log('Starting:', THIS);
  console.time(THIS);
  try {
    assert(event.token, 'missing event.token');
    if (!isValidAppToken(event.token, context)) {
      const response = new Twilio.Response();
      response.setStatusCode(401);
      response.appendHeader('Content-Type', 'application/json');
      response.setBody({ message: 'Unauthorized' });

      return callback(null, response);
    }

    const APPLICATION_NAME = await getParam(context, 'APPLICATION_NAME');
    const CUSTOMER_CODE = await getParam(context, 'CUSTOMER_CODE');
    const AWS_S3_BUCKET = await getParam(context, 'AWS_S3_BUCKET');
    const DEPLOYER_AWS_ROLE_ARN = await getParam(
      context,
      'DEPLOYER_AWS_ROLE_ARN'
    );
    const DEPLOYER_AWS_ACCESS_KEY_ID = await getParam(
      context,
      'DEPLOYER_AWS_ACCESS_KEY_ID'
    );
    const DEPLOYER_AWS_SECRET_ACCESS_KEY = await getParam(
      context,
      'DEPLOYER_AWS_SECRET_ACCESS_KEY'
    );
    const AWS_REGION = await getParam(context, 'AWS_REGION');
    const TWILIO_ACCOUNT_SID = await getParam(context, 'TWILIO_ACCOUNT_SID');
    const TWILIO_AUTH_TOKEN = await getParam(context, 'TWILIO_AUTH_TOKEN');
    const TWILIO_FLOW_SID = await getParam(context, 'TWILIO_FLOW_SID');
    const TWILIO_PHONE_NUMBER = await getParam(context, 'TWILIO_PHONE_NUMBER');
    const AWS_GLUE_DATABASE = await getParam(context, 'AWS_GLUE_DATABASE');
    const AWS_CF_STACK_BUCKET = await getParam(context, 'AWS_CF_STACK_BUCKET');
    const AWS_CF_STACK_APPLICATION = await getParam(
      context,
      'AWS_CF_STACK_APPLICATION'
    );
    const REMINDER_OUTREACH_START = await getParam(
      context,
      'REMINDER_OUTREACH_START'
    );
    const REMINDER_OUTREACH_FINISH = await getParam(
      context,
      'REMINDER_OUTREACH_FINISH'
    );
    const REMINDER_FIRST_TIMING = await getParam(
      context,
      'REMINDER_FIRST_TIMING'
    );
    const REMINDER_SECOND_TIMING = await getParam(
      context,
      'REMINDER_SECOND_TIMING'
    );
    const FILENAME_APPOINTMENT = await getParam(
      context,
      'FILENAME_APPOINTMENT'
    );

    const assets = Runtime.getAssets();
    const CF_TEMPLATE_PATH =
      assets['/aws/cloudformation-stack-application.yml'].path;

    // ---------- get aws clients
    const options = {
      accessKeyId: DEPLOYER_AWS_ACCESS_KEY_ID,
      secretAccessKey: DEPLOYER_AWS_SECRET_ACCESS_KEY,
      region: AWS_REGION,
    };
    const cf = new aws.CloudFormation(options);

    // ---------- look for dependent stack
    try {
      await cf.describeStacks({ StackName: AWS_CF_STACK_BUCKET }).promise();
    } catch (AmazonCloudFormationException) {
      throw new Error(`no dependent ${AWS_CF_STACK_BUCKET} stack!`);
    }

    // ---------- look for stack
    let action = null;
    try {
      await cf
        .describeStacks({ StackName: AWS_CF_STACK_APPLICATION })
        .promise();
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
    console.log(
      'Validating',
      AWS_CF_STACK_APPLICATION,
      'CloudFormation Stack...'
    );
    let response = await cf
      .validateTemplate({ TemplateBody: `${definition}` })
      .promise();

    response = null;
    switch (action) {
      case 'UPDATE':
        console.log(
          'Updating',
          AWS_CF_STACK_APPLICATION,
          'CloudFormation Stack ...'
        );
        try {
          const params = {
            StackName: AWS_CF_STACK_APPLICATION,
            TemplateBody: `${definition}`,
            RoleARN: DEPLOYER_AWS_ROLE_ARN,
            Parameters: [
              {
                ParameterKey: 'ParameterApplicationName',
                UsePreviousValue: true,
              },
              {
                ParameterKey: 'ParameterCustomerCode',
                UsePreviousValue: true,
              },
              { ParameterKey: 'ParameterS3Bucket', UsePreviousValue: true },
              {
                ParameterKey: 'ParameterTwilioAccountSID',
                UsePreviousValue: true,
              },
              {
                ParameterKey: 'ParameterTwilioAuthToken',
                UsePreviousValue: true,
              },
              {
                ParameterKey: 'ParameterTwilioFlowSID',
                UsePreviousValue: true,
              },
              {
                ParameterKey: 'ParameterTwilioPhoneNumber',
                UsePreviousValue: true,
              },
              {
                ParameterKey: 'ParameterGlueDatabase',
                UsePreviousValue: true,
              },
              {
                ParameterKey: 'ParameterFilenamePatternAppointment',
                UsePreviousValue: true,
              },
              {
                ParameterKey: 'ParameterReminderOutreachStart',
                UsePreviousValue: true,
              },
              {
                ParameterKey: 'ParameterReminderOutreachFinish',
                UsePreviousValue: true,
              },
              {
                ParameterKey: 'ParameterReminderFirstOffset',
                UsePreviousValue: true,
              },
              {
                ParameterKey: 'ParameterReminderSecondOffset',
                UsePreviousValue: true,
              },
            ],
            Capabilities: [
              'CAPABILITY_IAM',
              'CAPABILITY_NAMED_IAM',
              'CAPABILITY_AUTO_EXPAND',
            ],
          };
          response = await cf.updateStack(params).promise();
          console.log('Successfully initiated stack update');
        } catch (err) {
          if (err.message.includes('No updates are to be performed')) {
            console.log('No update stack needed as no change');
            response = 'No update stack needed as no change';
          } else throw err;
        }
        break;

      case 'CREATE':
        {
          console.log(
            'Creating',
            AWS_CF_STACK_APPLICATION,
            'CloudFormation Stack...'
          );
          const params = {
            StackName: AWS_CF_STACK_APPLICATION,
            TemplateBody: `${definition}`,
            RoleARN: DEPLOYER_AWS_ROLE_ARN,
            Parameters: [
              {
                ParameterKey: 'ParameterApplicationName',
                ParameterValue: APPLICATION_NAME,
              },
              {
                ParameterKey: 'ParameterCustomerCode',
                ParameterValue: CUSTOMER_CODE,
              },
              {
                ParameterKey: 'ParameterS3Bucket',
                ParameterValue: AWS_S3_BUCKET,
              },
              {
                ParameterKey: 'ParameterTwilioAccountSID',
                ParameterValue: TWILIO_ACCOUNT_SID,
              },
              {
                ParameterKey: 'ParameterTwilioAuthToken',
                ParameterValue: TWILIO_AUTH_TOKEN,
              },
              {
                ParameterKey: 'ParameterTwilioFlowSID',
                ParameterValue: TWILIO_FLOW_SID,
              },
              {
                ParameterKey: 'ParameterTwilioPhoneNumber',
                ParameterValue: TWILIO_PHONE_NUMBER,
              },
              {
                ParameterKey: 'ParameterGlueDatabase',
                ParameterValue: AWS_GLUE_DATABASE,
              },
              {
                ParameterKey: 'ParameterFilenamePatternAppointment',
                ParameterValue: FILENAME_APPOINTMENT,
              },
              {
                ParameterKey: 'ParameterReminderOutreachStart',
                ParameterValue: REMINDER_OUTREACH_START,
              },
              {
                ParameterKey: 'ParameterReminderOutreachFinish',
                ParameterValue: REMINDER_OUTREACH_FINISH,
              },
              {
                ParameterKey: 'ParameterReminderFirstOffset',
                ParameterValue: REMINDER_FIRST_TIMING,
              },
              {
                ParameterKey: 'ParameterReminderSecondOffset',
                ParameterValue: REMINDER_SECOND_TIMING,
              },
            ],
            OnFailure: 'ROLLBACK',
            Capabilities: [
              'CAPABILITY_IAM',
              'CAPABILITY_NAMED_IAM',
              'CAPABILITY_AUTO_EXPAND',
            ],
          };
          response = await cf.createStack(params).promise();
          console.log('Successfully initiated stack creation');
        }
        break;

      case 'DELETE':
        {
          console.log(
            'Deleting',
            AWS_CF_STACK_APPLICATION,
            'CloudFormation Stack...'
          );
          const params = {
            StackName: AWS_CF_STACK_APPLICATION,
          };
          response = await cf.deleteStack(params).promise();
          console.log('Successfully initiated stack deletion');
        }
        break;

      default:
        return callback('undefined action!');
        break;
    }
    return callback(null, response);
  } catch (err) {
    console.log(err);
    return callback(err);
  } finally {
    console.timeEnd(THIS);
  }
};
