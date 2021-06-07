const THIS = 'deployment/check-aws-application:';
// --------------------------------------------------------------------------------
// function description
//
// event:
// . action = DELETE, optional
// --------------------------------------------------------------------------------
const aws    = require('aws-sdk');
const path   = Runtime.getFunctions()['helpers'].path;
const { retrieveParameter, assignParameter } = require(path);

exports.handler = async function(context, event, callback) {
  console.log(THIS, 'Starting');
  console.time(THIS);
  try {

  const APPLICATION_CUSTOMER_CODE = await retrieveParameter(context, 'APPLICATION_CUSTOMER_CODE');
  const DEPLOYER_AWS_ACCESS_KEY_ID = await retrieveParameter(context, 'DEPLOYER_AWS_ACCESS_KEY_ID');
  const DEPLOYER_AWS_SECRET_ACCESS_KEY = await retrieveParameter(context, 'DEPLOYER_AWS_SECRET_ACCESS_KEY');
  const AWS_REGION = await retrieveParameter(context, 'AWS_REGION');

  // ---------- get aws clients
  const options = {
    accessKeyId: DEPLOYER_AWS_ACCESS_KEY_ID,
    secretAccessKey: DEPLOYER_AWS_SECRET_ACCESS_KEY,
    region: AWS_REGION
  };
  const cf = new aws.CloudFormation(options);

  // ---------- look for dependent stack
  try {
    const STACK = 'twilio-appointments-application-' + APPLICATION_CUSTOMER_CODE;
    const response = await cf.describeStacks({ StackName: STACK }).promise();
    const status = response.Stacks[0].StackStatus;

    console.log(THIS, 'StackStatus=', status);
    if ( status.endsWith('_COMPLETE')) {
      callback(null, 'DEPLOYED');
    } else if ( status.endsWith('_IN_PROGRESS')) {
      callback(null, 'DEPLOYING');
    } else {
      callback(null, 'FAILED');
    }

  } catch (AmazonCloudFormationException) {
    callback(null, 'NOT-DEPLOYED');
  }

  } finally {
    console.timeEnd(THIS);
  }
};
