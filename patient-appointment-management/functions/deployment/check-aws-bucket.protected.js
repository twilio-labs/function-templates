const THIS = 'deployment/check-aws-bucket:';
// --------------------------------------------------------------------------------
// function description
// --------------------------------------------------------------------------------
const aws    = require('aws-sdk');
const path   = Runtime.getFunctions()['helpers'].path;
const { retrieveParameter, assignParameter } = require(path);

exports.handler = async function(context, event, callback) {
  console.log(THIS, 'Starting');
  console.time(THIS);
  try {

  const CUSTOMER_CODE = await retrieveParameter(context, 'CUSTOMER_CODE');
  const APPOINTMENTS_S3_BUCKET = await retrieveParameter(context, 'APPOINTMENTS_S3_BUCKET');
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
    const STACK = 'twilio-appointments-bucket-' + CUSTOMER_CODE;
    const response = await cf.describeStacks({ StackName: STACK }).promise();
    const status = response.Stacks[0].StackStatus;

    if ( status.endsWith('_COMPLETE')) {
      console.log(THIS, 'StackStatus=', status);
      console.log(THIS, 'Returning=', APPOINTMENTS_S3_BUCKET);
      callback(null, APPOINTMENTS_S3_BUCKET);
    } else if ( status.endsWith('_IN_PROGRESS')) {
      console.log(THIS, 'StackStatus=', status);
      callback(null, 'DEPLOYING');
    } else {
      console.log(THIS, 'StackStatus=', status);
      callback(null, 'FAILED');
    }

  } catch (AmazonCloudFormationException) {
    console.log(THIS, 'StackStatus=', null);
    callback(null, 'NOT-DEPLOYED');
  }

  } finally {
    console.timeEnd(THIS);
  }
};
