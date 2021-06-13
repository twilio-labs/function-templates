/* eslint-disable camelcase */
const THIS = 'deployment/deploy-aws-code:';
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
const JSZip = require('jszip');

const { path } = Runtime.getFunctions().helpers;
const { getParam, setParam } = require(path);

exports.handler = async function (context, event, callback) {
  console.time(THIS);
  try {
    // ---------- parameters
    const CUSTOMER_CODE = await getParam(context, 'CUSTOMER_CODE');
    const AWS_S3_BUCKET = await getParam(context, 'AWS_S3_BUCKET');
    const DEPLOYER_AWS_ACCESS_KEY_ID = await getParam(
      context,
      'DEPLOYER_AWS_ACCESS_KEY_ID'
    );
    const DEPLOYER_AWS_SECRET_ACCESS_KEY = await getParam(
      context,
      'DEPLOYER_AWS_SECRET_ACCESS_KEY'
    );
    const AWS_REGION = await getParam(context, 'AWS_REGION');
    const AWS_LAMBDA_SEND_REMINDERS = await getParam(
      context,
      'AWS_LAMBDA_SEND_REMINDERS'
    );
    const AWS_LAMBDA_QUERY_STATE = await getParam(
      context,
      'AWS_LAMBDA_QUERY_STATE'
    );
    const AWS_LAMBDA_QUERY_HISTORY = await getParam(
      context,
      'AWS_LAMBDA_QUERY_HISTORY'
    );

    // ---------- get aws clients
    const options = {
      accessKeyId: DEPLOYER_AWS_ACCESS_KEY_ID,
      secretAccessKey: DEPLOYER_AWS_SECRET_ACCESS_KEY,
      region: AWS_REGION,
    };
    const s3 = new aws.S3(options);
    const lambda = new aws.Lambda(options);

    {
      // ---------- twilioNodeLibrary.zip
      const assets = Runtime.getAssets();
      const content = fs.readFileSync(
        assets['/aws/twilioNodeLibrary.zip'].path
      );

      let needs_upload = false;
      const params = {
        Bucket: AWS_S3_BUCKET,
        Key: 'artifacts/twilioNodeLibrary.zip',
      };
      try {
        const response = await s3.headObject(params).promise();
        needs_upload = content.length !== response.ContentLength;
        console.log(
          THIS,
          'local file size=',
          content.length,
          needs_upload ? '!=' : '==',
          's3 file size=',
          response.ContentLength
        );
      } catch {
        needs_upload = true;
      }

      if (needs_upload) {
        params.Body = content;
        params.ServerSideEncryption = 'AES256';
        const response = await s3.upload(params).promise();
        console.log('Uploaded:', response.Location);

        // update lambda layer & function if code is changed
      }
    }

    {
      // ---------- send_appointment_reminders.zip
      const assets = Runtime.getAssets();
      const payload = fs.readFileSync(
        assets['/aws/send_appointment_reminders.js'].path
      );
      const zip = new JSZip();
      await zip.file('index.js', payload);
      await zip
        .generateAsync({ type: 'binarystring' })
        .then(function (content) {
          fs.writeFileSync(
            '/tmp/send_appointment_reminders.zip',
            content,
            'binary'
          );
        });

      const content = fs.readFileSync('/tmp/send_appointment_reminders.zip');
      let params = {
        Bucket: AWS_S3_BUCKET,
        Key: 'artifacts/send_appointment_reminders.zip',
        Body: content,
        ServerSideEncryption: 'AES256',
      };
      let response = await s3.upload(params).promise();
      console.log('Uploaded:', response.Location);

      let found_function = false;
      params = {
        FunctionName: AWS_LAMBDA_SEND_REMINDERS,
      };
      try {
        response = await lambda.getFunction(params).promise();
        console.log('Found lambda function:', response.FunctionName);
        found_function = true;
      } catch (err) {
        console.log('No lambda function:', params.FunctionName);
        found_function = false;
      }

      if (found_function) {
        params = {
          FunctionName: AWS_LAMBDA_SEND_REMINDERS,
          S3Bucket: AWS_S3_BUCKET,
          S3Key: 'artifacts/send_appointment_reminders.zip',
        };
        response = await lambda.updateFunctionCode(params).promise();
        console.log('Updated lambda function code for:', response.FunctionName);
      }
    }

    {
      // ---------- query_appointment_state.zip
      const assets = Runtime.getAssets();
      const payload = fs.readFileSync(
        assets['/aws/query_appointment_state.js'].path
      );
      const zip = new JSZip();
      await zip.file('index.js', payload);
      await zip
        .generateAsync({ type: 'binarystring' })
        .then(function (content) {
          fs.writeFileSync(
            '/tmp/query_appointment_state.zip',
            content,
            'binary'
          );
        });

      const content = fs.readFileSync('/tmp/query_appointment_state.zip');
      let params = {
        Bucket: AWS_S3_BUCKET,
        Key: 'artifacts/query_appointment_state.zip',
        Body: content,
        ServerSideEncryption: 'AES256',
      };
      let response = await s3.upload(params).promise();
      console.log('Uploaded:', response.Location);

      let found_function = false;
      params = {
        FunctionName: AWS_LAMBDA_QUERY_STATE,
      };
      try {
        response = await lambda.getFunction(params).promise();
        console.log('Found lambda function:', response.FunctionName);
        found_function = true;
      } catch (err) {
        console.log('No lambda function:', params.FunctionName);
        found_function = false;
      }

      if (found_function) {
        params = {
          FunctionName: AWS_LAMBDA_QUERY_STATE,
          S3Bucket: AWS_S3_BUCKET,
          S3Key: 'artifacts/query_appointment_state.zip',
        };
        response = await lambda.updateFunctionCode(params).promise();
        console.log('Updated lambda function code for:', response.FunctionName);
      }
    }

    {
      // ---------- query_appointment_history.zip
      const assets = Runtime.getAssets();
      const payload = fs.readFileSync(
        assets['/aws/query_appointment_history.js'].path
      );
      const zip = new JSZip();
      await zip.file('index.js', payload);
      await zip
        .generateAsync({ type: 'binarystring' })
        .then(function (content) {
          fs.writeFileSync(
            '/tmp/query_appointment_history.zip',
            content,
            'binary'
          );
        });

      const content = fs.readFileSync('/tmp/query_appointment_history.zip');
      let params = {
        Bucket: AWS_S3_BUCKET,
        Key: 'artifacts/query_appointment_history.zip',
        Body: content,
        ServerSideEncryption: 'AES256',
      };
      let response = await s3.upload(params).promise();
      console.log('Uploaded:', response.Location);

      let found_function = false;
      params = {
        FunctionName: AWS_LAMBDA_QUERY_HISTORY,
      };
      try {
        response = await lambda.getFunction(params).promise();
        console.log('Found lambda function:', response.FunctionName);
        found_function = true;
      } catch (err) {
        console.log('No lambda function:', params.FunctionName);
        found_function = false;
      }

      if (found_function) {
        params = {
          FunctionName: AWS_LAMBDA_QUERY_HISTORY,
          S3Bucket: AWS_S3_BUCKET,
          S3Key: 'artifacts/query_appointment_history.zip',
        };
        response = await lambda.updateFunctionCode(params).promise();
        console.log('Updated lambda function code for:', response.FunctionName);
      }
    }

    return callback(null, 'success');
  } finally {
    console.timeEnd(THIS);
  }
};
