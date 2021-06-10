/* eslint-disable camelcase */

const THIS = 'deployment/check:';
/*
 * --------------------------------------------------------------------------------
 * function description
 *
 * event:
 * . action = DELETE, optional
 * --------------------------------------------------------------------------------
 */
const aws = require('aws-sdk');

const { path } = Runtime.getFunctions().helpers;
const { retrieveParameter, assignParameter } = require(path);

exports.handler = async function (context, event, callback) {
  console.log(THIS, 'Starting');
  console.time(THIS);
  try {
    if (event.hasOwnProperty('name') && event.name !== undefined) {
      const value = await retrieveParameter(context, event.name);

      callback(null, value);
      return;
    } else {
      const parameters = {
        ACCOUNT_SID: await retrieveParameter(context, 'ACCOUNT_SID'),
        APPLICATION_FILENAME_PATTERN_APPOINTMENT: await retrieveParameter(
          context,
          'APPLICATION_FILENAME_PATTERN_APPOINTMENT'
        ),
        AWS_S3_BUCKET: await retrieveParameter(context, 'AWS_S3_BUCKET'),
        AUTH_TOKEN: await retrieveParameter(context, 'AUTH_TOKEN'),
        AWS_ACCESS_KEY_ID: await retrieveParameter(
          context,
          'AWS_ACCESS_KEY_ID'
        ),
        AWS_SECRET_ACCESS_KEY: await retrieveParameter(
          context,
          'AWS_SECRET_ACCESS_KEY'
        ),
        AWS_REGION: await retrieveParameter(context, 'AWS_REGION'),
        AWS_CF_STACK_APPLICATION: await retrieveParameter(
          context,
          'AWS_CF_STACK_APPLICATION'
        ),
        AWS_CF_STACK_BUCKET: await retrieveParameter(
          context,
          'AWS_CF_STACK_BUCKET'
        ),
        APPLICATION_CUSTOMER_CODE: await retrieveParameter(
          context,
          'APPLICATION_CUSTOMER_CODE'
        ),
        CUSTOMER_NAME: await retrieveParameter(context, 'CUSTOMER_NAME'),
        CUSTOMER_EHR_ENDPOINT_URL: await retrieveParameter(
          context,
          'CUSTOMER_EHR_ENDPOINT_URL'
        ),
        DEPLOYER_AWS_ACCESS_KEY_ID: await retrieveParameter(
          context,
          'DEPLOYER_AWS_ACCESS_KEY_ID'
        ),
        DEPLOYER_AWS_SECRET_ACCESS_KEY: await retrieveParameter(
          context,
          'DEPLOYER_AWS_SECRET_ACCESS_KEY'
        ),
        TWILIO_ENVIRONMENT_SID: await retrieveParameter(
          context,
          'TWILIO_ENVIRONMENT_SID'
        ),
        TWILIO_ENVIRONMENT_DOMAIN_NAME: await retrieveParameter(
          context,
          'TWILIO_ENVIRONMENT_DOMAIN_NAME'
        ),
        TWILIO_FLOW_SID: await retrieveParameter(context, 'TWILIO_FLOW_SID'),
        AWS_LAMBDA_SEND_REMINDERS: await retrieveParameter(
          context,
          'AWS_LAMBDA_SEND_REMINDERS'
        ),
        REMINDER_OUTREACH_START: await retrieveParameter(
          context,
          'REMINDER_OUTREACH_START'
        ),
        REMINDER_OUTREACH_FINISH: await retrieveParameter(
          context,
          'REMINDER_OUTREACH_FINISH'
        ),
        REMINDER_FIRST_OFFSET: await retrieveParameter(
          context,
          'REMINDER_FIRST_OFFSET'
        ),
        REMINDER_SECOND_OFFSET: await retrieveParameter(
          context,
          'REMINDER_SECOND_OFFSET'
        ),
        TWILIO_SERVICE_SID: await retrieveParameter(
          context,
          'TWILIO_SERVICE_SID'
        ),
        TWILIO_PHONE_NUMBER: await retrieveParameter(
          context,
          'TWILIO_PHONE_NUMBER'
        ),
      };

      console.log(
        THIS,
        'Note that some environment variables are null until the component is deployed'
      );
      console.log(THIS, parameters);

      callback(null, parameters);
      return;
    }
  } finally {
    console.timeEnd(THIS);
  }
};
