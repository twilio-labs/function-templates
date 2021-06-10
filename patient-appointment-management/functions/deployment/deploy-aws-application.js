/* eslint-disable camelcase */
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

const { path } = Runtime.getFunctions().helpers;
const { retrieveParameter, assignParameter } = require(path);

exports.handler = async function (context, event, callback) {
  console.log('Starting:', THIS);
  console.time(THIS);
  try {
    const APPLICATION_NAME = await retrieveParameter(
      context,
      'APPLICATION_NAME'
    );
    const APPLICATION_CUSTOMER_CODE = await retrieveParameter(
      context,
      'APPLICATION_CUSTOMER_CODE'
    );
    const AWS_S3_BUCKET = await retrieveParameter(context, 'AWS_S3_BUCKET');
    const DEPLOYER_AWS_ACCESS_KEY_ID = await retrieveParameter(
      context,
      'DEPLOYER_AWS_ACCESS_KEY_ID'
    );
    const DEPLOYER_AWS_SECRET_ACCESS_KEY = await retrieveParameter(
      context,
      'DEPLOYER_AWS_SECRET_ACCESS_KEY'
    );
    const AWS_REGION = await retrieveParameter(context, 'AWS_REGION');
    const TWILIO_ACCOUNT_SID = await retrieveParameter(
      context,
      'TWILIO_ACCOUNT_SID'
    );
    const TWILIO_AUTH_TOKEN = await retrieveParameter(
      context,
      'TWILIO_AUTH_TOKEN'
    );
    const TWILIO_TWILIO_FLOW_SID = await retrieveParameter(
      context,
      'TWILIO_FLOW_SID'
    );
    const TWILIO_PHONE_NUMBER = await retrieveParameter(
      context,
      'TWILIO_PHONE_NUMBER'
    );
    const TWILIO_FLOW_SID = await retrieveParameter(context, 'TWILIO_FLOW_SID');
    const AWS_LAMBDA_SEND_REMINDERS = await retrieveParameter(
      context,
      'AWS_LAMBDA_SEND_REMINDERS'
    );
    const AWS_GLUE_CRAWLER = await retrieveParameter(
      context,
      'AWS_GLUE_CRAWLER'
    );
    const AWS_GLUE_DATABASE = await retrieveParameter(
      context,
      'AWS_GLUE_DATABASE'
    );
    const AWS_CF_STACK_BUCKET = await retrieveParameter(
      context,
      'AWS_CF_STACK_BUCKET'
    );
    const AWS_CF_STACK_APPLICATION = await retrieveParameter(
      context,
      'AWS_CF_STACK_APPLICATION'
    );
    const REMINDER_OUTREACH_START = await retrieveParameter(
      context,
      'REMINDER_OUTREACH_START'
    );
    const REMINDER_OUTREACH_FINISH = await retrieveParameter(
      context,
      'REMINDER_OUTREACH_FINISH'
    );
    const REMINDER_FIRST_OFFSET = await retrieveParameter(
      context,
      'REMINDER_FIRST_OFFSET'
    );
    const REMINDER_SECOND_OFFSET = await retrieveParameter(
      context,
      'REMINDER_SECOND_OFFSET'
    );
    const APPLICATION_FILENAME_PATTERN_APPOINTMENT = await retrieveParameter(
      context,
      'APPLICATION_FILENAME_PATTERN_APPOINTMENT'
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
    const s3 = new aws.S3(options);

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
                ParameterKey: 'ParameterLambdaSendReminders',
                UsePreviousValue: true,
              },
              {
                ParameterKey: 'ParameterGlueCrawlerName',
                UsePreviousValue: true,
              },
              {
                ParameterKey: 'ParameterGlueDatabaseName',
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
        console.log(
          'Creating',
          AWS_CF_STACK_APPLICATION,
          'CloudFormation Stack...'
        );
        let params = {
          StackName: AWS_CF_STACK_APPLICATION,
          TemplateBody: `${definition}`,
          Parameters: [
            {
              ParameterKey: 'ParameterApplicationName',
              ParameterValue: APPLICATION_NAME,
            },
            {
              ParameterKey: 'ParameterCustomerCode',
              ParameterValue: APPLICATION_CUSTOMER_CODE,
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
              ParameterKey: 'ParameterLambdaSendReminders',
              ParameterValue: AWS_LAMBDA_SEND_REMINDERS,
            },
            {
              ParameterKey: 'ParameterGlueCrawler',
              ParameterValue: AWS_GLUE_CRAWLER,
            },
            {
              ParameterKey: 'ParameterGlueDatabase',
              ParameterValue: AWS_GLUE_DATABASE,
            },
            {
              ParameterKey: 'ParameterFilenamePatternAppointment',
              ParameterValue: APPLICATION_FILENAME_PATTERN_APPOINTMENT,
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
              ParameterValue: REMINDER_FIRST_OFFSET,
            },
            {
              ParameterKey: 'ParameterReminderSecondOffset',
              ParameterValue: REMINDER_SECOND_OFFSET,
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
        break;

      case 'DELETE':
        console.log(
          'Deleting',
          AWS_CF_STACK_APPLICATION,
          'CloudFormation Stack...'
        );
        params = {
          StackName: AWS_CF_STACK_APPLICATION,
        };
        response = await cf.deleteStack(params).promise();
        console.log('Successfully initiated stack deletion');
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
