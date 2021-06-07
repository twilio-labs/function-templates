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
  console.log(THIS, 'Begin');
  console.time(THIS);
  try {

  // ---------- parameters
  const AWS_DEPLOYER_AWS_ACCESS_KEY_ID     = await retrieveParameter(context, 'AWS_DEPLOYER_AWS_ACCESS_KEY_ID');
  const AWS_DEPLOYER_AWS_SECRET_ACCESS_KEY = await retrieveParameter(context, 'AWS_DEPLOYER_AWS_SECRET_ACCESS_KEY');
  const AWS_REGION                     = await retrieveParameter(context, 'AWS_REGION');
  const AWS_S3_BUCKET                  = await retrieveParameter(context, 'AWS_S3_BUCKET');
  const AWS_LAMBDA_SEND_OUTREACH       = await retrieveParameter(context, 'AWS_LAMBDA_SEND_OUTREACH');

  // ---------- get aws clients
  const options = {
      accessKeyId: AWS_DEPLOYER_AWS_ACCESS_KEY_ID,
      secretAccessKey: AWS_DEPLOYER_AWS_SECRET_ACCESS_KEY,
      region: AWS_REGION
  };
  const s3 = new aws.S3(options);
  const lambda = new aws.Lambda(options);

  {
    // ---------- twilioPython.zip
    const assets = Runtime.getAssets();
    const content = fs.readFileSync(assets['/aws/twilioPython.zip'].path);

    let needs_upload = false;
    let params = {
      Bucket: AWS_S3_BUCKET,
      Key: 'artifacts/twilioPython.zip'
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
    // ---------- send_outreach_pcp_followup.zip
    const assets = Runtime.getAssets();
    const payload = fs.readFileSync(assets['/aws/send_outreach_pcp_followup.py'].path);
    zip.file('index.py', payload);
    const data = await zip.generate({ base64:false, compression:'DEFLATE' });
    fs.writeFileSync('send_outreach_pcp_followup.zip', data, 'binary');

    const content = fs.readFileSync('send_outreach_pcp_followup.zip');
    let params = {
      Bucket: AWS_S3_BUCKET,
      Key: 'artifacts/send_outreach_pcp_followup.zip',
      Body: content,
      ServerSideEncryption: 'AES256'
    }
    let response = await s3.upload(params).promise();
    console.log(THIS, 'Uploaded:', response.Location);

    let found_function = false;
    params = {
      FunctionName: AWS_LAMBDA_SEND_OUTREACH
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
        FunctionName: AWS_LAMBDA_SEND_OUTREACH,
        S3Bucket: AWS_S3_BUCKET,
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
