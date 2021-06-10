/* eslint-disable camelcase */
const THIS = 'deployment/check-aws-application:';
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
    const AWS_CF_STACK_APPLICATION = await retrieveParameter(
      context,
      'AWS_CF_STACK_APPLICATION'
    );
    const DEPLOYER_AWS_ACCESS_KEY_ID = await retrieveParameter(
      context,
      'DEPLOYER_AWS_ACCESS_KEY_ID'
    );
    const DEPLOYER_AWS_SECRET_ACCESS_KEY = await retrieveParameter(
      context,
      'DEPLOYER_AWS_SECRET_ACCESS_KEY'
    );
    const AWS_REGION = await retrieveParameter(context, 'AWS_REGION');

    // ---------- get aws clients
    const options = {
      accessKeyId: DEPLOYER_AWS_ACCESS_KEY_ID,
      secretAccessKey: DEPLOYER_AWS_SECRET_ACCESS_KEY,
      region: AWS_REGION,
    };
    const cf = new aws.CloudFormation(options);

    // ---------- look for dependent stack
    try {
      const response = await cf
        .describeStacks({ StackName: AWS_CF_STACK_APPLICATION })
        .promise();
      const status = response.Stacks[0].StackStatus;

      console.log(THIS, 'StackStatus=', status);
      if (status.endsWith('_COMPLETE')) {
        callback(null, 'DEPLOYED');
        return;
      } else if (status.endsWith('_IN_PROGRESS')) {
        callback(null, 'DEPLOYING');
        return;
      } else {
        callback(null, 'FAILED');
        return;
      }
    } catch (AmazonCloudFormationException) {
      callback(null, 'NOT-DEPLOYED');
      return;
    }
  } finally {
    console.timeEnd(THIS);
  }
};
