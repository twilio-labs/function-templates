/* eslint-disable camelcase, dot-notation, complexity, sonarjs/cognitive-complexity */

const path = require('path');

const THIS = path.basename(__filename, '.js');
/*
 * --------------------------------------------------------------------------------
 * function description
 *
 * event:
 * . action = DELETE, optional
 * --------------------------------------------------------------------------------
 */
const assert = require('assert');
const AWS = require('aws-sdk');

const path0 = Runtime.getFunctions()['helpers'].path;
const { getParam, setParam } = require(path0);
const path1 = Runtime.getFunctions()['auth'].path;
const { isValidAppToken } = require(path1);

// --------------------------------------------------------------------------------
async function checkParameters(context) {
  const errors = [];
  let v = null;

  v = context.CUSTOMER_NAME;
  if (!v) errors.push({ CUSTOMER_NAME: 'cannot be empty' });

  v = context.CUSTOMER_CODE;
  if (!v) errors.push({ CUSTOMER_CODE: 'cannot be empty' });
  const format = /[A-Z !@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+/;
  if (format.test(v)) errors.push({ CUSTOMER_CODE: `${v} is invalid` });

  v = context.REMINDER_OUTREACH_START;
  if (!v) errors.push({ REMINDER_OUTREACH_START: 'cannot be empty' });
  if (!/^\d+$/.test(v))
    errors.push({ REMINDER_OUTREACH_START: `${v} not only digits` });
  if (v.length !== 4)
    errors.push({ REMINDER_OUTREACH_START: `${v} not 4 digits` });
  if (v > 2400)
    errors.push({ REMINDER_OUTREACH_START: `${v} not between 0000 and 2400` });

  v = context.REMINDER_OUTREACH_FINISH;
  if (!v) errors.push({ REMINDER_OUTREACH_FINISH: 'cannot be empty' });
  if (!/^\d+$/.test(v))
    errors.push({ REMINDER_OUTREACH_FINISH: `${v} not only digits` });
  if (v.length !== 4)
    errors.push({ REMINDER_OUTREACH_FINISH: `${v} not 4 digits` });
  if (v > 2400)
    errors.push({ REMINDER_OUTREACH_FINISH: `${v} not between 0000 and 2400` });
  if (context.REMINDER_OUTREACH_START >= v)
    errors.push({
      REMINDER_OUTREACH_FINISH: `${v} cannot be earlier than REMINDER_OUTREACH_START`,
    });

  v = context.REMINDER_FIRST_TIMING;
  if (!v) errors.push({ REMINDER_FIRST_TIMING: 'cannot be empty' });
  if (!/^\d+$/.test(v))
    errors.push({ REMINDER_FIRST_TIMING: `${v} not only digits` });
  if (v.length !== 4)
    errors.push({ REMINDER_FIRST_TIMING: `${v} not 4 digits` });

  v = context.REMINDER_SECOND_TIMING;
  if (!v) errors.push({ REMINDER_SECOND_TIMING: 'cannot be empty' });
  if (!/^\d+$/.test(v))
    errors.push({ REMINDER_SECOND_TIMING: `${v} not only digits` });
  if (v.length !== 4)
    errors.push({ REMINDER_SECOND_TIMING: `${v} not 4 digits` });
  if (context.REMINDER_FIRST_TIMING <= v)
    errors.push({
      REMINDER_SECOND_TIMING: `${v} cannot be earlier than REMINDER_FIRST_TIMING`,
    });

  v = context.AWS_REGION;
  if (!v) errors.push({ AWS_REGION: 'cannot be empty' });
  if (!v.startsWith('us'))
    errors.push({ AWS_REGION: `${v} only us aws regions` });

  v = context.DEPLOYER_AWS_SECRET_ACCESS_KEY;
  if (!v) errors.push({ DEPLOYER_AWS_SECRET_ACCESS_KEY: 'cannot be empty' });
  if (v.length < 16 || v.length > 128)
    errors.push({
      DEPLOYER_AWS_SECRET_ACCESS_KEY: 'length is not between 16 and 128',
    });
  v = context.DEPLOYER_AWS_ACCESS_KEY_ID;
  if (!v) errors.push({ DEPLOYER_AWS_ACCESS_KEY_ID: 'cannot be empty' });
  if (v.length < 16 || v.length > 128)
    errors.push({
      DEPLOYER_AWS_ACCESS_KEY_ID: 'length is not between 16 and 128',
    });
  try {
    const options = {
      accessKeyId: context.DEPLOYER_AWS_ACCESS_KEY_ID,
      secretAccessKey: context.DEPLOYER_AWS_SECRET_ACCESS_KEY,
      region: context.AWS_REGION,
    };
    const sts = new AWS.STS(options);
    await sts.getCallerIdentity({}).promise();
  } catch (err) {
    errors.push({
      DEPLOYER_AWS_ACCESS_KEY_ID: `${v} may be invalid, unable to authenticate to AWS`,
    });
    errors.push({
      DEPLOYER_AWS_SECRET_ACCESS_KEY:
        'may be invalid, unable to authenticate to AWS',
    });
  }
  return errors;
}

// --------------------------------------------------------------------------------
async function listParameters(context) {
  return {
    ACCOUNT_SID: await getParam(context, 'ACCOUNT_SID'),
    AUTH_TOKEN:
      (await getParam(context, 'AUTH_TOKEN')) === null
        ? null
        : (await getParam(context, 'AUTH_TOKEN')).replace(/./g, '*'),
    DEPLOYER_AWS_ROLE_ARN: await getParam(context, 'DEPLOYER_AWS_ROLE_ARN'),
    DEPLOYER_AWS_ACCESS_KEY_ID: await getParam(
      context,
      'DEPLOYER_AWS_ACCESS_KEY_ID'
    ),
    DEPLOYER_AWS_SECRET_ACCESS_KEY:
      (await getParam(context, 'DEPLOYER_AWS_SECRET_ACCESS_KEY')) === null
        ? null
        : (await getParam(context, 'DEPLOYER_AWS_SECRET_ACCESS_KEY')).replace(
            /./g,
            '*'
          ),
    AWS_ACCESS_KEY_ID: await getParam(context, 'AWS_ACCESS_KEY_ID'),
    AWS_SECRET_ACCESS_KEY:
      (await getParam(context, 'AWS_SECRET_ACCESS_KEY')) === null
        ? null
        : (await getParam(context, 'AWS_SECRET_ACCESS_KEY')).replace(/./g, '*'),
    AWS_ATHENA_WORKGROUP: await getParam(context, 'AWS_ATHENA_WORKGROUP'),
    AWS_CF_STACK_APPLICATION: await getParam(
      context,
      'AWS_CF_STACK_APPLICATION'
    ),
    AWS_CF_STACK_BUCKET: await getParam(context, 'AWS_CF_STACK_BUCKET'),
    AWS_CF_STACK_DEPLOYER: await getParam(context, 'AWS_CF_STACK_DEPLOYER'),
    AWS_GLUE_CRAWLER: await getParam(context, 'AWS_GLUE_CRAWLER'),
    AWS_GLUE_DATABASE: await getParam(context, 'AWS_GLUE_DATABASE'),
    AWS_LAMBDA_SEND_REMINDERS: await getParam(
      context,
      'AWS_LAMBDA_SEND_REMINDERS'
    ),
    AWS_LAMBDA_QUERY_STATE: await getParam(context, 'AWS_LAMBDA_QUERY_STATE'),
    AWS_LAMBDA_QUERY_HISTORY: await getParam(
      context,
      'AWS_LAMBDA_QUERY_HISTORY'
    ),
    AWS_REGION: await getParam(context, 'AWS_REGION'),
    AWS_S3_BUCKET: await getParam(context, 'AWS_S3_BUCKET'),
    AWS_SECRET_AWS_ARN: await getParam(context, 'AWS_SECRET_AWS_ARN'),
    AWS_SECRET_TWILIO_ARN: await getParam(context, 'AWS_SECRET_TWILIO_ARN'),
    AWS_SFN_QUERY_HISTORY: await getParam(context, 'AWS_SFN_QUERY_HISTORY'),
    AWS_SFN_QUERY_STATE: await getParam(context, 'AWS_SFN_QUERY_STATE'),
    CUSTOMER_CODE: await getParam(context, 'CUSTOMER_CODE'),
    CUSTOMER_NAME: await getParam(context, 'CUSTOMER_NAME'),
    FILENAME_APPOINTMENT: await getParam(context, 'FILENAME_APPOINTMENT'),
    REMINDER_OUTREACH_START: await getParam(context, 'REMINDER_OUTREACH_START'),
    REMINDER_OUTREACH_FINISH: await getParam(
      context,
      'REMINDER_OUTREACH_FINISH'
    ),
    REMINDER_FIRST_TIMING: await getParam(context, 'REMINDER_FIRST_TIMING'),
    REMINDER_SECOND_TIMING: await getParam(context, 'REMINDER_SECOND_TIMING'),
    TWILIO_ENVIRONMENT_SID: await getParam(context, 'TWILIO_ENVIRONMENT_SID'),
    TWILIO_ENVIRONMENT_DOMAIN_NAME: await getParam(
      context,
      'TWILIO_ENVIRONMENT_DOMAIN_NAME'
    ),
    TWILIO_FLOW_SID: await getParam(context, 'TWILIO_FLOW_SID'),
    TWILIO_SERVICE_SID: await getParam(context, 'TWILIO_SERVICE_SID'),
    TWILIO_PHONE_NUMBER: await getParam(context, 'TWILIO_PHONE_NUMBER'),
  };
}

// --------------------------------------------------------------------------------
exports.handler = async function (context, event, callback) {
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

    if (event.action === 'CHECK' || !event.action) {
      errors = await checkParameters(context);
      return callback(null, errors);
    } else if (event.action === 'LIST') {
      parameters = await listParameters(context);
      return callback(null, parameters);
    }
    return callback(`unknown action ${event.action}`);
  } catch (err) {
    console.log(err);
    return callback(err);
  } finally {
    console.timeEnd(THIS);
  }
};
