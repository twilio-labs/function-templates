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
const { getParam, setParam } = require(path);

exports.handler = async function (context, event, callback) {
  console.log(THIS, 'Begin');
  console.time(THIS);
  try {
    const AWS_CF_STACK_APPLICATION = await getParam(
      context,
      'AWS_CF_STACK_APPLICATION'
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
      if (status.endsWith('_COMPLETE')) return callback(null, 'DEPLOYED');
      else if (status.endsWith('_IN_PROGRESS'))
        return callback(null, 'DEPLOYING');
      return callback(null, 'FAILED');
    } catch (AmazonCloudFormationException) {
      return callback(null, 'NOT-DEPLOYED');
    }
  } finally {
    console.timeEnd(THIS);
  }
};
