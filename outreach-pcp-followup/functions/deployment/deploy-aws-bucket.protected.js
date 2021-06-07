const THIS = 'deployment/deploy-aws-bucket';
// --------------------------------------------------------------------------------
// deploys cloudformation stack for bucket
//
// event:
// . action = DELETE, optional
//
// returns:
// . AWS.Request returned from stack function
// --------------------------------------------------------------------------------
const fs   = require('fs');
const aws  = require('aws-sdk');
const path = Runtime.getFunctions()['helpers'].path;
const { retrieveParameter, assignParameter } = require(path);

exports.handler = async function(context, event, callback) {
  console.log(THIS, 'Begin');
  console.time(THIS);
  try {

  const APPLICATION_CUSTOMER_CODE          = await retrieveParameter(context, 'APPLICATION_CUSTOMER_CODE');
  const AWS_DEPLOYER_AWS_ACCESS_KEY_ID     = await retrieveParameter(context, 'AWS_DEPLOYER_AWS_ACCESS_KEY_ID');
  const AWS_DEPLOYER_AWS_SECRET_ACCESS_KEY = await retrieveParameter(context, 'AWS_DEPLOYER_AWS_SECRET_ACCESS_KEY');
  const AWS_REGION                         = await retrieveParameter(context, 'AWS_REGION');
  const AWS_S3_BUCKET                      = await retrieveParameter(context, 'AWS_S3_BUCKET');
  const AWS_LAMBDA_SEND_OUTREACH           = await retrieveParameter(context, 'AWS_LAMBDA_SEND_OUTREACH');
  const AWS_CF_STACK_BUCKET                = await retrieveParameter(context, 'AWS_CF_STACK_BUCKET');
  const AWS_CF_STACK_APPLICATION           = await retrieveParameter(context, 'AWS_CF_STACK_APPLICATION');

  const assets = Runtime.getAssets();
  const CF_TEMPLATE_PATH = assets['/aws/cloudformation-stack-bucket.yml'].path;

  // ---------- get aws clients
  const options = {
    accessKeyId: AWS_DEPLOYER_AWS_ACCESS_KEY_ID,
    secretAccessKey: AWS_DEPLOYER_AWS_SECRET_ACCESS_KEY,
    region: AWS_REGION
  };
  const cf = new aws.CloudFormation(options);
  const s3 = new aws.S3(options);

  // ---------- determine 'action' to execute
  let action = null;
  if (event.hasOwnProperty('action') && event.action === 'DELETE') {
    action = 'DELETE'; // explicit caller request to delete stack, does not check if stack exists
  } else {
    try {
      const response = await cf.describeStacks({StackName: AWS_CF_STACK_APPLICATION}).promise();
      const stackStatus = response.Stacks[0].StackStatus;
      action = 'UPDATE'; // stack exists so update stack, but check if it is deploying first
    } catch (AmazonCloudFormationException) {
      action = 'CREATE'; // stack does not exist
    }
  }

  // ---------- read & validate CF template
  const definition = fs.readFileSync(CF_TEMPLATE_PATH);
  console.log(THIS, 'Validating', AWS_CF_STACK_BUCKET, 'CloudFormation Stack...');
  let response = await cf.validateTemplate({ TemplateBody: `${definition}` }).promise();

  switch (action) {

    case 'UPDATE':
    {
      console.log(THIS, 'Updating', AWS_CF_STACK_BUCKET, 'CloudFormation Stack ...');
      try {
       let params = {
          StackName: AWS_CF_STACK_BUCKET,
          TemplateBody: `${definition}`,
          Parameters: [
            {ParameterKey: 'ParameterCustomerCode', UsePreviousValue: true},
            {ParameterKey: 'ParameterS3Bucket', UsePreviousValue: true},
            {ParameterKey: 'ParameterLambdaSendOutreach', UsePreviousValue: true}
          ],
          Capabilities: ['CAPABILITY_IAM', 'CAPABILITY_NAMED_IAM', 'CAPABILITY_AUTO_EXPAND']
        }
        response = await cf.updateStack(params).promise();
        console.log(THIS, 'Successfully initiated stack update')
        callback(null, response);
      } catch (err) {
        if (err.message.includes('No updates are to be performed')) {
          console.log(THIS, 'No update stack needed as no change')
        } else {
          throw err;
        }
      }
    }
    break;

    case 'CREATE':
    {
      console.log(THIS, 'Creating', AWS_CF_STACK_BUCKET, 'CloudFormation Stack...');
      let params = {
        StackName: AWS_CF_STACK_BUCKET,
        TemplateBody: `${definition}`,
        Parameters: [
          {ParameterKey: 'ParameterCustomerCode', ParameterValue: APPLICATION_CUSTOMER_CODE},
          {ParameterKey: 'ParameterS3Bucket', ParameterValue: AWS_S3_BUCKET},
          {ParameterKey: 'ParameterLambdaSendOutreach', ParameterValue: AWS_LAMBDA_SEND_OUTREACH}
        ],
        OnFailure: 'ROLLBACK',
        Capabilities: ['CAPABILITY_IAM', 'CAPABILITY_NAMED_IAM', 'CAPABILITY_AUTO_EXPAND']
      }
      response = await cf.createStack(params).promise();
      console.log(THIS, 'Successfully initiated stack creation')
      callback(null, response);
    }
    break;

    case 'DELETE':
    {
      // ---------- look for dependent stack
      try {
        await cf.describeStacks({ StackName: AWS_CF_STACK_BUCKET }).promise();
        throw new Error('exists dependent ' + AWS_CF_STACK_BUCKET + ' stack!');
      } catch (AmazonCloudFormationException) {
        // no dependent stack, so good
      }

      console.log(THIS, 'Emptying', AWS_S3_BUCKET, 'S3 Bucket...');

      // ----------
      async function _deleteKeys(params, s3client) {
        const response = await s3client.listObjectsV2(params).promise();
        console.log(THIS, 'deleting:', response.KeyCount);
        response.Contents.forEach(obj => s3client.deleteObject(
          { Bucket: params.Bucket, Key: obj.Key }
          , function(err, data) {
            if (err) console.log(err, err.stack); // an error occurred
            else console.log(THIS, obj.Key);
          })
        );

        if (response.NextContinuationToken) {
          params.ContinuationToken = response.NextContinuationToken;
          await _deleteKeys(params, s3client); // recursive synchronous call
        }
      }

      // TODO: add check for bucket existence
      await _deleteKeys({ Bucket: AWS_S3_BUCKET, Prefix: '' }, s3);

      console.log(THIS, 'Deleting', AWS_CF_STACK_BUCKET, 'CloudFormation Stack...');
      let params = {
        StackName: AWS_CF_STACK_BUCKET
      }
      response = await cf.deleteStack(params).promise();
      console.log(THIS, 'Successfully initiated stack deletion')
      callback(null, response);
    }
    break;

    default:
      callback(`undefined action ${action}!`);

  } // end switch

  } finally {
    console.timeEnd(THIS);
  }
};
