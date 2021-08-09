/* eslint-disable camelcase, dot-notation, sonarjs/cognitive-complexity */
const THIS = 'deployment/deploy-aws-bucket';
/*
 * --------------------------------------------------------------------------------
 * function description
 *
 * event:
 * . action = DELETE, optional
 * --------------------------------------------------------------------------------
 */
const assert = require('assert');
const fs = require('fs');
const aws = require('aws-sdk');

const path0 = Runtime.getFunctions()['helpers'].path;
const { getParam, setParam } = require(path0);
const path1 = Runtime.getFunctions()['auth'].path;
const { isValidAppToken } = require(path1);

exports.handler = async function (context, event, callback) {
  console.log('Starting:', THIS);
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

    const APPLICATION_NAME = await getParam(context, 'APPLICATION_NAME');
    const CUSTOMER_CODE = await getParam(context, 'CUSTOMER_CODE');
    const AWS_S3_BUCKET = await getParam(context, 'AWS_S3_BUCKET');
    const DEPLOYER_AWS_ROLE_ARN = await getParam(
      context,
      'DEPLOYER_AWS_ROLE_ARN'
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
    const AWS_CF_STACK_BUCKET = await getParam(context, 'AWS_CF_STACK_BUCKET');
    const AWS_CF_STACK_APPLICATION = await getParam(
      context,
      'AWS_CF_STACK_APPLICATION'
    );

    const assets = Runtime.getAssets();
    const CF_TEMPLATE_PATH =
      assets['/aws/cloudformation-stack-bucket.yml'].path;

    // ---------- get aws clients
    const options = {
      accessKeyId: DEPLOYER_AWS_ACCESS_KEY_ID,
      secretAccessKey: DEPLOYER_AWS_SECRET_ACCESS_KEY,
      region: AWS_REGION,
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
    let response = await cf
      .validateTemplate({ TemplateBody: `${definition}` })
      .promise();

    response = null;
    switch (action) {
      case 'UPDATE':
        console.log(
          'Updating',
          AWS_CF_STACK_BUCKET,
          'CloudFormation Stack ...'
        );
        try {
          const params = {
            StackName: AWS_CF_STACK_BUCKET,
            TemplateBody: `${definition}`,
            RoleARN: DEPLOYER_AWS_ROLE_ARN,
            Parameters: [
              {
                ParameterKey: 'ParameterApplicationName',
                UsePreviousValue: true,
              },
              {
                ParameterKey: 'ParameterCustomerCode',
                UsePreviousValue: true,
              },
              { ParameterKey: 'ParameterS3Bucket', UsePreviousValue: true },
            ],
            Capabilities: [
              'CAPABILITY_IAM',
              'CAPABILITY_NAMED_IAM',
              'CAPABILITY_AUTO_EXPAND',
            ],
          };
          response = await cf.updateStack(params).promise();
          console.log('Successfully initiated stack update');
        } catch (err) {
          if (err.message.includes('No updates are to be performed')) {
            console.log('No update stack needed as no change');
            response = 'No update stack needed as no change';
          } else {
            throw err;
          }
        }
        break;

      case 'CREATE':
        console.log('Creating', AWS_CF_STACK_BUCKET, 'CloudFormation Stack...');
        const params = {
          StackName: AWS_CF_STACK_BUCKET,
          TemplateBody: `${definition}`,
          RoleARN: DEPLOYER_AWS_ROLE_ARN,
          Parameters: [
            {
              ParameterKey: 'ParameterApplicationName',
              ParameterValue: APPLICATION_NAME,
            },
            {
              ParameterKey: 'ParameterCustomerCode',
              ParameterValue: CUSTOMER_CODE,
            },
            {
              ParameterKey: 'ParameterS3Bucket',
              ParameterValue: AWS_S3_BUCKET,
            },
          ],
          OnFailure: 'ROLLBACK',
          Capabilities: [
            'CAPABILITY_IAM',
            'CAPABILITY_NAMED_IAM',
            'CAPABILITY_AUTO_EXPAND',
          ],
        };
        response = await cf.createStack(params).promise();
        console.log('Successfully initiated stack creation');
        break;

      case 'DELETE':
        {
          // ---------- look for dependent stack
          try {
            await cf
              .describeStacks({ StackName: AWS_CF_STACK_APPLICATION })
              .promise();
            throw new Error(
              `exists dependent ${AWS_CF_STACK_APPLICATION}stack!`
            );
          } catch (AmazonCloudFormationException) {}

          console.log('Emptying ', AWS_S3_BUCKET, 'S3 Bucket...');

          async function _deleteKeys(params, s3client) {
            const response = await s3client.listObjectsV2(params).promise();
            console.log('deleting:', response.KeyCount);
            response.Contents.forEach((obj) =>
              s3client.deleteObject(
                { Bucket: params.Bucket, Key: obj.Key },
                function (err, data) {
                  if (err) console.log(err, err.stack);
                  // an error occurred
                  else console.log(obj.Key);
                }
              )
            );

            if (response.NextContinuationToken) {
              params.ContinuationToken = response.NextContinuationToken;
              await _deleteKeys(params, s3client); // recursive synchronous call
            }
          }
          await _deleteKeys({ Bucket: AWS_S3_BUCKET, Prefix: '' }, s3);

          console.log(
            'Deleting',
            AWS_CF_STACK_BUCKET,
            'CloudFormation Stack...'
          );
          const params = {
            StackName: AWS_CF_STACK_BUCKET,
          };
          response = await cf.deleteStack(params).promise();
          console.log('Successfully initiated stack deletion');
        }
        break;

      default:
        return callback('undefined action!');
        break;
    }
    return callback(null, response);
  } catch (err) {
    console.log(err);
    return callback(err);
  } finally {
    console.timeEnd(THIS);
  }
};
