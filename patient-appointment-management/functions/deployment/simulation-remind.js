/* eslint-disable prefer-destructuring, dot-notation, consistent-return, spaced-comment */

const path0 = Runtime.getFunctions().helpers.path;
const { getParam, setParam } = require(path0);
const AWS = require('aws-sdk');

async function remindAppointment(context) {
  const AWS_CONFIG = {
    accessKeyId: await getParam(context, 'AWS_ACCESS_KEY_ID'),
    secretAccessKey: await getParam(context, 'AWS_SECRET_ACCESS_KEY'),
    region: await getParam(context, 'AWS_REGION'),
  };
  context.Lambda = new AWS.Lambda(AWS_CONFIG);
  context.AWS_LAMBDA_SEND_REMINDERS = await getParam(
      context,
      'AWS_LAMBDA_SEND_REMINDERS'
  );
  console.log(context);
  const params = {
    FunctionName: context.AWS_LAMBDA_SEND_REMINDERS,
    InvocationType: 'RequestResponse',
  };
  const response = await context.Lambda.invoke(params).promise();
}


exports.handler = function (context, event, callback) {
  const path = Runtime.getFunctions()['auth'].path;
  const { isValidAppToken } = require(path);

  if (!isValidAppToken(event.token, context)) {
    const response = new Twilio.Response();
    response.setStatusCode(401);
    response.appendHeader(
      'Error-Message',
      'Invalid or expired token. Please refresh the page and login again.'
    );
    response.appendHeader('Content-Type', 'application/json');
    response.setBody({ message: 'Unauthorized' });

    return callback(null, response);
  }

  const response = new Twilio.Response();
  response.appendHeader('Content-Type', 'application/json');

  // Main function

  // Call studio flow with appointment
  remindAppointment(context)
    .then(function () {
      response.setBody({});
      callback(null, response);
    })
    .catch(function (err) {
      console.log(err);
      callback(null);
    });
};

