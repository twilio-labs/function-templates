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
const { getParam, setParam } = require(path);

exports.handler = async function (context, event, callback) {
  console.log(THIS, 'Begin');
  console.time(THIS);
  try {
    if (event.hasOwnProperty('name') && event.name !== undefined) {
      const value = await getParam(context, event.name);

      return callback(null, value);
    }
    const parameters = {
      ACCOUNT_SID: await getParam(context, 'ACCOUNT_SID'),
      FILENAME_APPOINTMENT: await getParam(context, 'FILENAME_APPOINTMENT'),
      AWS_S3_BUCKET: await getParam(context, 'AWS_S3_BUCKET'),
      AUTH_TOKEN: await getParam(context, 'AUTH_TOKEN'),
      AWS_ACCESS_KEY_ID: await getParam(context, 'AWS_ACCESS_KEY_ID'),
      AWS_SECRET_ACCESS_KEY: await getParam(context, 'AWS_SECRET_ACCESS_KEY'),
      AWS_REGION: await getParam(context, 'AWS_REGION'),
      AWS_CF_STACK_APPLICATION: await getParam(
        context,
        'AWS_CF_STACK_APPLICATION'
      ),
      AWS_CF_STACK_BUCKET: await getParam(context, 'AWS_CF_STACK_BUCKET'),
      CUSTOMER_CODE: await getParam(context, 'CUSTOMER_CODE'),
      CUSTOMER_NAME: await getParam(context, 'CUSTOMER_NAME'),
      CUSTOMER_EHR_ENDPOINT_URL: await getParam(
        context,
        'CUSTOMER_EHR_ENDPOINT_URL'
      ),
      DEPLOYER_AWS_ACCESS_KEY_ID: await getParam(
        context,
        'DEPLOYER_AWS_ACCESS_KEY_ID'
      ),
      DEPLOYER_AWS_SECRET_ACCESS_KEY: await getParam(
        context,
        'DEPLOYER_AWS_SECRET_ACCESS_KEY'
      ),
      TWILIO_ENVIRONMENT_SID: await getParam(context, 'TWILIO_ENVIRONMENT_SID'),
      TWILIO_ENVIRONMENT_DOMAIN_NAME: await getParam(
        context,
        'TWILIO_ENVIRONMENT_DOMAIN_NAME'
      ),
      TWILIO_FLOW_SID: await getParam(context, 'TWILIO_FLOW_SID'),
      TWILIO_SERVICE_SID: await getParam(context, 'TWILIO_SERVICE_SID'),
      AWS_GLUE_CRAWLER: await getParam(context, 'AWS_GLUE_CRAWLER'),
      AWS_GLUE_DATABASE: await getParam(context, 'AWS_GLUE_DATABASE'),
      AWS_LAMBDA_QUERY_HISTORY: await getParam(
        context,
        'AWS_LAMBDA_QUERY_HISTORY'
      ),
      AWS_LAMBDA_QUERY_STATE: await getParam(context, 'AWS_LAMBDA_QUERY_STATE'),
      AWS_LAMBDA_SEND_REMINDERS: await getParam(
        context,
        'AWS_LAMBDA_SEND_REMINDERS'
      ),
      AWS_SFN_QUERY_HISTORY: await getParam(context, 'AWS_SFN_QUERY_HISTORY'),
      AWS_SFN_QUERY_STATE: await getParam(context, 'AWS_SFN_QUERY_STATE'),
      REMINDER_OUTREACH_START: await getParam(
        context,
        'REMINDER_OUTREACH_START'
      ),
      REMINDER_OUTREACH_FINISH: await getParam(
        context,
        'REMINDER_OUTREACH_FINISH'
      ),
      REMINDER_FIRST_OFFSET: await getParam(context, 'REMINDER_FIRST_OFFSET'),
      REMINDER_SECOND_OFFSET: await getParam(context, 'REMINDER_SECOND_OFFSET'),
      TWILIO_SERVICE_SID: await getParam(context, 'TWILIO_SERVICE_SID'),
      TWILIO_PHONE_NUMBER: await getParam(context, 'TWILIO_PHONE_NUMBER'),
    };

    console.log(THIS, parameters);

    return callback(null, parameters);
  } catch (err) {
    console.log(err);
    return callback(err);
  } finally {
    console.timeEnd(THIS);
  }
};
