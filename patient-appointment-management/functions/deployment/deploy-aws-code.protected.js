const THIS = 'deployment/deploy-aws-code:';
// --------------------------------------------------------------------------------
// function description
//
// event:
// . action = DELETE, optional
// --------------------------------------------------------------------------------
const assert = require('assert');
const fs     = require('fs');
const aws    = require('aws-sdk');
const zip    = new require('node-zip')();
const path   = Runtime.getFunctions()['helpers'].path;
const { retrieveParameter, assignParameter } = require(path);

exports.handler = async function(context, event, callback) {
  console.log(THIS, 'Starting');
  console.time(THIS);
  try {

  // ---------- parameters
  const CUSTOMER_CODE                  = await retrieveParameter(context, 'CUSTOMER_CODE');
  const APPOINTMENTS_S3_BUCKET         = await retrieveParameter(context, 'APPOINTMENTS_S3_BUCKET');
  const DEPLOYER_AWS_ACCESS_KEY_ID     = await retrieveParameter(context, 'DEPLOYER_AWS_ACCESS_KEY_ID');
  const DEPLOYER_AWS_SECRET_ACCESS_KEY = await retrieveParameter(context, 'DEPLOYER_AWS_SECRET_ACCESS_KEY');
  const AWS_REGION                     = await retrieveParameter(context, 'AWS_REGION');
  const LAMBDA_SEND_REMINDERS          = await retrieveParameter(context, 'LAMBDA_SEND_REMINDERS');

  // ---------- get aws clients
  const options = {
      accessKeyId: DEPLOYER_AWS_ACCESS_KEY_ID,
      secretAccessKey: DEPLOYER_AWS_SECRET_ACCESS_KEY,
      region: AWS_REGION
  };
  const s3 = new aws.S3(options);
  const lambda = new aws.Lambda(options);

  {
    // ---------- twilioNodeLibrary.zip
    const assets = Runtime.getAssets();
    const content = fs.readFileSync(assets['/aws/twilioNodeLibrary.zip'].path);

    let needs_upload = false;
    let params = {
      Bucket: APPOINTMENTS_S3_BUCKET,
      Key: 'artifacts/twilioNodeLibrary.zip'
    }
    try {
      const response = await s3.headObject(params).promise();
      needs_upload = (content.length != response.ContentLength);
      console.log(THIS, 'local file size=', content.length
        , ((needs_upload) ? '!=' : '==')
        , 's3 file size=', response.ContentLength);
    } catch {
      needs_upload = true;
    }

    if (needs_upload) {
      params.Body = content;
      params.ServerSideEncryption = 'AES256';
      const response = await s3.upload(params).promise();
      console.log(THIS, 'Uploaded:', response.Location)

      // update lambda layer & function if code is changed

    }
  }

  {
    // ---------- send_appointment_reminders.zip
    const assets = Runtime.getAssets();
    const payload = fs.readFileSync(assets['/aws/send_appointment_reminders.js'].path);
    zip.file('index.js', payload);
    const data = await zip.generate({ base64:false, compression:'DEFLATE' });
    fs.writeFileSync('send_appointment_reminders.zip', data, 'binary');

    const content = fs.readFileSync('send_appointment_reminders.zip');
    let params = {
      Bucket: APPOINTMENTS_S3_BUCKET,
      Key: 'artifacts/send_appointment_reminders.zip',
      Body: content,
      ServerSideEncryption: 'AES256'
    }
    let response = await s3.upload(params).promise();
    console.log(THIS, 'Uploaded:', response.Location);

    let found_function = false;
    params = {
      FunctionName: LAMBDA_SEND_REMINDERS
    }
    try {
      response = await lambda.getFunction(params).promise();
      console.log(THIS, 'Found lambda function:', response.FunctionName);
      found_function = true;
    } catch (err) {
      console.log(THIS, 'No lambda function:', params.FunctionName);
      found_function = false;
    }

    if (found_function) {
      params = {
        FunctionName: LAMBDA_SEND_REMINDERS,
        S3Bucket: APPOINTMENTS_S3_BUCKET,
        S3Key: 'artifacts/send_appointment_reminders.zip'
      }
      response = await lambda.updateFunctionCode(params).promise();
      console.log('Updated lambda function code for:', response.FunctionName);
    }
  }

  callback(null, 'success');

  } finally {
    console.timeEnd(THIS);
  }
};
