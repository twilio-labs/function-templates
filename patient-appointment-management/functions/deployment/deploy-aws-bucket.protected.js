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

  const CUSTOMER_CODE                  = await retrieveParameter(context, 'CUSTOMER_CODE');
  const APPOINTMENTS_S3_BUCKET         = await retrieveParameter(context, 'APPOINTMENTS_S3_BUCKET');
  const DEPLOYER_AWS_ACCESS_KEY_ID     = await retrieveParameter(context, 'DEPLOYER_AWS_ACCESS_KEY_ID');
  const DEPLOYER_AWS_SECRET_ACCESS_KEY = await retrieveParameter(context, 'DEPLOYER_AWS_SECRET_ACCESS_KEY');
  const AWS_REGION                     = await retrieveParameter(context, 'AWS_REGION');
  const CLOUDFORMATION_BUCKET_STACK    = await retrieveParameter(context, 'CLOUDFORMATION_BUCKET_STACK');

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
      await cf.describeStacks({ StackName: CLOUDFORMATION_BUCKET_STACK }).promise();
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
  console.log('Validating', CLOUDFORMATION_BUCKET_STACK, 'CloudFormation Stack...');
  let response = await cf.validateTemplate({ TemplateBody: `${definition}` }).promise();

  switch (action) {

    case 'UPDATE':
    {
      console.log('Updating', CLOUDFORMATION_BUCKET_STACK, 'CloudFormation Stack ...');
      try {
       let params = {
          StackName: CLOUDFORMATION_BUCKET_STACK,
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
      console.log('Creating', CLOUDFORMATION_BUCKET_STACK, 'CloudFormation Stack...');
      let params = {
        StackName: CLOUDFORMATION_BUCKET_STACK,
        TemplateBody: `${definition}`,
        Parameters: [
          {ParameterKey: 'ParamCustomerName', ParameterValue: CUSTOMER_CODE},
          {ParameterKey: 'ParamAppointmentsS3BucketName', ParameterValue: APPOINTMENTS_S3_BUCKET}
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
        await cf.describeStacks({ StackName: 'twilio-appointments-application-' + CUSTOMER_CODE }).promise();
        throw new Error('exists dependent twilio-appointments-application-' + CUSTOMER_CODE + 'stack!');
      } catch (AmazonCloudFormationException) {
      }

      console.log('Emptying ', APPOINTMENTS_S3_BUCKET, 'S3 Bucket...');
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
          await _deleteKeys(params); // recursive synchronous call
        }
      }
      await _deleteKeys({ Bucket: APPOINTMENTS_S3_BUCKET, Prefix: '' }, s3);

      console.log('Deleting', CLOUDFORMATION_BUCKET_STACK, 'CloudFormation Stack...');
      let params = {
        StackName: CLOUDFORMATION_BUCKET_STACK
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
