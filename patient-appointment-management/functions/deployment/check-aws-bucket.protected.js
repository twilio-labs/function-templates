/* eslint-disable camelcase */
const THIS = 'deployment/check-aws-bucket:';
/*
 * --------------------------------------------------------------------------------
 * function description
 * --------------------------------------------------------------------------------
 */
const aws = require('aws-sdk');

const { path } = Runtime.getFunctions().helpers;
const { retrieveParameter, assignParameter } = require(path);

exports.handler = async function (context, event, callback) {
  console.log(THIS, 'Starting');
  console.time(THIS);
  try {
    const AWS_S3_BUCKET = await retrieveParameter(context, 'AWS_S3_BUCKET');
    const AWS_CF_STACK_BUCKET = await retrieveParameter(
      context,
      'AWS_CF_STACK_BUCKET'
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
        .describeStacks({ StackName: AWS_CF_STACK_BUCKET })
        .promise();
      const status = response.Stacks[0].StackStatus;

      if (status.endsWith('_COMPLETE')) {
        console.log(THIS, 'StackStatus=', status);
        console.log(THIS, 'Returning=', AWS_S3_BUCKET);
        callback(null, AWS_S3_BUCKET);
        return;
      } else if (status.endsWith('_IN_PROGRESS')) {
        console.log(THIS, 'StackStatus=', status);
        callback(null, 'DEPLOYING');
        return;
      } else {
        console.log(THIS, 'StackStatus=', status);
        callback(null, 'FAILED');
        return;
      }
    } catch (AmazonCloudFormationException) {
      console.log(THIS, 'StackStatus=', null);
      callback(null, 'NOT-DEPLOYED');
      return;
    }
  } finally {
    console.timeEnd(THIS);
  }
};
