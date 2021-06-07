const THIS = 'deployment/deploy-aws-bucket';
// --------------------------------------------------------------------------------
// function description
//
// event:
// . action = DELETE, optional
// --------------------------------------------------------------------------------
const assert = require('assert');
const fs     = require('fs');
const aws    = require('aws-sdk');
const path   = Runtime.getFunctions()['helpers'].path;
const { retrieveParameter, assignParameter } = require(path);

exports.handler = async function(context, event, callback) {
  console.log('Starting:', THIS);
  console.time(THIS);
  try {

  const APPLICATION_CUSTOMER_CODE                  = await retrieveParameter(context, 'APPLICATION_CUSTOMER_CODE');
  const AWS_S3_BUCKET         = await retrieveParameter(context, 'AWS_S3_BUCKET');
  const DEPLOYER_AWS_ACCESS_KEY_ID     = await retrieveParameter(context, 'DEPLOYER_AWS_ACCESS_KEY_ID');
  const DEPLOYER_AWS_SECRET_ACCESS_KEY = await retrieveParameter(context, 'DEPLOYER_AWS_SECRET_ACCESS_KEY');
  const AWS_REGION                     = await retrieveParameter(context, 'AWS_REGION');
  const AWS_CF_STACK_BUCKET    = await retrieveParameter(context, 'AWS_CF_STACK_BUCKET');

  const assets = Runtime.getAssets();
  const CF_TEMPLATE_PATH = assets['/aws/twilio-appointments-bucket.yml'].path;

  // ---------- get aws clients
  const options = {
      accessKeyId: DEPLOYER_AWS_ACCESS_KEY_ID,
      secretAccessKey: DEPLOYER_AWS_SECRET_ACCESS_KEY,
      region: AWS_REGION
  };
  const cf = new aws.CloudFormation(options);
  const s3 = new aws.S3(options);

  // ---------- look for stack
  let action = null;
  try {
      await cf.describeStacks({ StackName: AWS_CF_STACK_BUCKET }).promise();
      if (event.hasOwnProperty('action') && event.action === 'DELETE') {
        action = 'DELETE';
      } else {
        action = 'UPDATE';
      }
  } catch (AmazonCloudFormationException) {
      action = 'CREATE';
  }

  // ---------- read & validate CF template
  const definition = fs.readFileSync(CF_TEMPLATE_PATH);
  console.log('Validating', AWS_CF_STACK_BUCKET, 'CloudFormation Stack...');
  let response = await cf.validateTemplate({ TemplateBody: `${definition}` }).promise();

  switch (action) {

    case 'UPDATE':
    {
      console.log('Updating', AWS_CF_STACK_BUCKET, 'CloudFormation Stack ...');
      try {
       let params = {
          StackName: AWS_CF_STACK_BUCKET,
          TemplateBody: `${definition}`,
          Parameters: [
            {ParameterKey: 'ParamCustomerName', UsePreviousValue: true},
            {ParameterKey: 'ParamAppointmentsS3BucketName', UsePreviousValue: true}
          ],
          Capabilities: ['CAPABILITY_IAM', 'CAPABILITY_NAMED_IAM', 'CAPABILITY_AUTO_EXPAND']
        }
        response = await cf.updateStack(params).promise();
        console.log('Successfully initiated stack update')
        callback(null, response);
      } catch (err) {
        if (err.message.includes('No updates are to be performed')) {
          console.log('No update stack needed as no change')
        } else {
          throw err;
        }
      }
    }
    break;

    case 'CREATE':
    {
      console.log('Creating', AWS_CF_STACK_BUCKET, 'CloudFormation Stack...');
      let params = {
        StackName: AWS_CF_STACK_BUCKET,
        TemplateBody: `${definition}`,
        Parameters: [
          {ParameterKey: 'ParamCustomerName', ParameterValue: APPLICATION_CUSTOMER_CODE},
          {ParameterKey: 'ParamAppointmentsS3BucketName', ParameterValue: AWS_S3_BUCKET}
        ],
        OnFailure: 'ROLLBACK',
        Capabilities: ['CAPABILITY_IAM', 'CAPABILITY_NAMED_IAM', 'CAPABILITY_AUTO_EXPAND']
      }
      response = await cf.createStack(params).promise();
      console.log('Successfully initiated stack creation')
      callback(null, response);
    }
    break;

    case 'DELETE':
    {
      // ---------- look for dependent stack
      try {
        await cf.describeStacks({ StackName: 'twilio-appointments-application-' + APPLICATION_CUSTOMER_CODE }).promise();
        throw new Error('exists dependent twilio-appointments-application-' + APPLICATION_CUSTOMER_CODE + 'stack!');
      } catch (AmazonCloudFormationException) {
      }

      console.log('Emptying ', AWS_S3_BUCKET, 'S3 Bucket...');

      async function _deleteKeys(params, s3client) {
        const response = await s3client.listObjectsV2(params).promise();
        console.log('deleting:', response.KeyCount);
        response.Contents.forEach(obj => s3client.deleteObject(
          { Bucket: params.Bucket, Key: obj.Key }
          , function(err, data) {
            if (err) console.log(err, err.stack); // an error occurred
            else console.log(obj.Key);
          })
        );

        if (response.NextContinuationToken) {
          params.ContinuationToken = response.NextContinuationToken;
          await _deleteKeys(params, s3client); // recursive synchronous call
        }
      }
      await _deleteKeys({ Bucket: AWS_S3_BUCKET, Prefix: '' }, s3);

      console.log('Deleting', AWS_CF_STACK_BUCKET, 'CloudFormation Stack...');
      let params = {
        StackName: AWS_CF_STACK_BUCKET
      }
      response = await cf.deleteStack(params).promise();
      console.log('Successfully initiated stack deletion')
      callback(null, response);
    }
    break;

    default:
      callback('undefined action!');

  }

  } finally {
    console.timeEnd(THIS);
  }
};
