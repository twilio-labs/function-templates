const THIS = 'find-by-phone:'
// --------------------------------------------------------------------------------
// find appointments via patient phone
//
// TODO: Note that functionality wrt opted-out is incomplete
//
// events.flow_sid   - flow sid (eg, FWxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx)
// event.appointment - flow.data that will be parenthesis enclosed comma-separated
//                     key=value string. Note that values will not be enclosed in quotes.
//                     (eg., {k1=v1, k2=v2, k3=v3} )
// returns
// . code = 200, if successful
//
// --------------------------------------------------------------------------------

// --------------------------------------------------------------------------------
async function getAppointmentsByPhone(params, phone, s3client, allKeys = []){
  const response = await s3client.listObjectsV2(params).promise();
  response.Contents.forEach(function(obj) {
    if (obj.Key.includes(patient_id + '.json')) {
      allKeys.push(obj.Key);
    }
  });

  if (response.NextContinuationToken) {
    params.ContinuationToken = response.NextContinuationToken;
    await getAppointmentsByPhone(params, phone, s3client, allKeys); // recursive synchronous call
  }
  return allKeys;
}

// --------------------------------------------------------------------------------
exports.handler = async function(context, event, callback) {
  console.log(THIS, 'Begin');
  console.time(THIS);
  try {
    const assert = require('assert');
    const AWS = require('aws-sdk');
    const path = Runtime.getFunctions()['helpers'].path;
    const { retrieveParameter, assignParameter} = require(path);

    // ---------- validate environment variables & input event
    const AWS_ACCESS_KEY_ID                        = await retrieveParameter(context, 'AWS_ACCESS_KEY_ID');
    const AWS_SECRET_ACCESS_KEY                    = await retrieveParameter(context, 'AWS_SECRET_ACCESS_KEY');
    const AWS_REGION                               = await retrieveParameter(context, 'AWS_REGION');
    const AWS_S3_BUCKET                            = await retrieveParameter(context, 'AWS_S3_BUCKET');
    const APPLICATION_FILENAME_PATTERN_APPOINTMENT = await retrieveParameter(context, 'APPLICATION_FILENAME_PATTERN_APPOINTMENT');
    const TWILIO_FLOW_SID                          = await retrieveParameter(context, 'TWILIO_FLOW_SID');
    assert (event.hasOwnProperty('appointment')  , 'missing input event.appointment');
    assert (event.hasOwnProperty('patient_phone'), 'missing input event.phone');
  
    // initialize s3 client
    const s3 = new AWS.S3({
      accessKeyId: AWS_ACCESS_KEY_ID,
      secretAccessKey: AWS_SECRET_ACCESS_KEY,
      region: AWS_REGION
    });

    console.log(THIS, 'find active appointments for phone=', event.phone);
    // ----------- find all appointments for patient_id
    let params = {
        Bucket: AWS_S3_BUCKET,
        Key: [
            'state',
            'flow='+TWILIO_FLOW_SID,
            'disposition=QUEUED',
            ''
        ].join('/')
    }
    keys_q = await getAppointmentsByPhone(params, event.phone, s3);

    params = {
        Bucket: AWS_S3_BUCKET,
        Key: [
            'state',
            'flow=' + event.flow_sid,
            'disposition=REMINDED-1',
            ''
        ].join('/')
    }
    keys_r1 = await getAppointmentsByPhone(params, event.phone, s3);

    params = {
        Bucket: AWS_S3_BUCKET,
        Key: [
            'state',
            'flow=' + event.flow_sid,
            'disposition=REMINDED-2',
            ''
        ].join('/')
    }
    keys_r2 = await getAppointmentsByPhone(params, event.phone, s3);

    appointment_s3keys = keys_q.concat(keys_r1).concat(keys_r2);
    console.log('found active appointments: ', appointment_s3keys.length);

    n = 0;
    for (let i = 0; i < appointment_s3keys.length; i++) {
        const s3key = appointment_s3keys[i];
        console.log('appointment_s3key=', s3key);
    }


    // if phone == null then no match
    // look through matches to find earliest appointment

    const response = {
        code: 200,
        appointment_count: n,
        appointment: appointment
    };
    return callback(null, response);
};
