/* eslint-disable camelcase, dot-notation */
const THIS = 'deployment/check-aws-application:';
/*
 * --------------------------------------------------------------------------------
 * function description
 *
 * event:
 * . action = DELETE, optional
 * --------------------------------------------------------------------------------
 */
const assert = require('assert');
const aws = require('aws-sdk');

const path0 = Runtime.getFunctions()['helpers'].path;
const { getParam, setParam } = require(path0);
const path1 = Runtime.getFunctions()['auth'].path;
const { isValidAppToken } = require(path1);

exports.handler = async function (context, event, callback) {
  console.log(THIS, 'Begin');
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

    // ---------- get aws clients
    const options = {
      accessKeyId: await getParam(context, 'DEPLOYER_AWS_ACCESS_KEY_ID'),
      secretAccessKey: await getParam(
        context,
        'DEPLOYER_AWS_SECRET_ACCESS_KEY'
      ),
      region: await getParam(context, 'AWS_REGION'),
    };
    const cf = new aws.CloudFormation(options);

    // ---------- look for dependent stack
    try {
      const AWS_CF_STACK_APPLICATION = await getParam(
        context,
        'AWS_CF_STACK_APPLICATION'
      );
      const response = await cf
        .describeStacks({ StackName: AWS_CF_STACK_APPLICATION })
        .promise();
      const status = response.Stacks[0].StackStatus;

      console.log(THIS, 'StackStatus=', status);
      if (status === 'CREATE_COMPLETE' || status === 'UPDATE_COMPLETE') {
        return callback(null, 'DEPLOYED');
      } else if (status.endsWith('_IN_PROGRESS')) {
        return callback(null, 'DEPLOYING');
      }
      return callback(null, 'FAILED');
    } catch (AmazonCloudFormationException) {
      // AWS will throw exception if matching stack is not found
      return callback(null, 'NOT-DEPLOYED');
    }
  } finally {
    console.timeEnd(THIS);
  }
};
