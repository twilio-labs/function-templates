const THIS = 'deployment/check-aws-bucket:';
// --------------------------------------------------------------------------------
// checks deployment status of cloudformation stack for bucket
//
// returns:
// . NOT-DEPLOYED|DEPLOYING|DEPLOYED|ERRORED
// --------------------------------------------------------------------------------
const aws    = require('aws-sdk');
const path   = Runtime.getFunctions()['helpers'].path;
const { retrieveParameter, assignParameter } = require(path);

exports.handler = async function(context, event, callback) {
  console.log(THIS, 'Begin');
  console.time(THIS);
  try {

  const AWS_DEPLOYER_AWS_ACCESS_KEY_ID     = await retrieveParameter(context, 'AWS_DEPLOYER_AWS_ACCESS_KEY_ID');
  const AWS_DEPLOYER_AWS_SECRET_ACCESS_KEY = await retrieveParameter(context, 'AWS_DEPLOYER_AWS_SECRET_ACCESS_KEY');
  const AWS_REGION                         = await retrieveParameter(context, 'AWS_REGION');
  const AWS_CF_STACK_BUCKET                = await retrieveParameter(context, 'AWS_CF_STACK_BUCKET');

  // ---------- get aws clients
  const options = {
    accessKeyId: AWS_DEPLOYER_AWS_ACCESS_KEY_ID,
    secretAccessKey: AWS_DEPLOYER_AWS_SECRET_ACCESS_KEY,
    region: AWS_REGION
  };
  const cf = new aws.CloudFormation(options);

  // ---------- check stack status
  try {
    const response = await cf.describeStacks({ StackName: AWS_CF_STACK_BUCKET }).promise();
    const status = response.Stacks[0].StackStatus;
    console.log(THIS, 'StackStatus=', status);

    if      (status.endsWith('IN_PROGRESS')) callback(null, 'DEPLOYING');
    else if (status === 'CREATE_COMPLETE')   callback(null, 'DEPLOYED');
    else if (status === 'UPDATE_COMPLETE')   callback(null, 'DEPLOYED');
    else                                     callback(null, 'ERRORED');

  } catch (AmazonCloudFormationException) {  callback(null, 'NOT-DEPLOYED'); }

  } finally {
    console.timeEnd(THIS);
  }
};
