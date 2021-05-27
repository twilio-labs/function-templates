const THIS = 'find-by-phone:'

const assert = require('assert');
const aws = require('aws-sdk');

// --------------------------------------------------------------------------------
async function getAppointmentsByPhone(params, phone, s3client, allKeys = []){
  const response = await s3client.listObjectsV2(params).promise();
  response.Contents.forEach(function(obj) {
    if (obj.includes(patient_id + '.json')) {
      allKeys.push(obj.Key);
    }
  });

  if (response.NextContinuationToken) {
    params.ContinuationToken = response.NextContinuationToken;
    await getAllKeys(params, allKeys); // recursive synchronous call
  }
  return allKeys;
}

// --------------------------------------------------------------------------------
// events.flow_sid   - flow sid (eg, FWxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx)
// event.appointment - flow.data that will be parenthesis enclosed comma-separated
//                     key=value string. Note that values will not be enclosed in quotes.
//                     (eg., {k1=v1, k2=v2, k3=v3} )
// --------------------------------------------------------------------------------
exports.handler = async function(context, event, callback) {
  // ---------- validate enviroment variables & input event
  const AWS_ACCESS_KEY_ID            = await retrieveParameter(context, 'DEPLOYER_AWS_ACCESS_KEY_ID');
  const AWS_SECRET_ACCESS_KEY        = await retrieveParameter(context, 'DEPLOYER_AWS_SECRET_ACCESS_KEY');
  const AWS_REGION                   = await retrieveParameter(context, 'AWS_REGION');
  const APPOINTMENTS_S3_BUCKET       = await retrieveParameter(context, 'APPOINTMENTS_S3_BUCKET');
  const APPOINTMENT_FILENAME_PATTERN = await retrieveParameter(context, 'APPOINTMENT_FILENAME_PATTERN');
  assert (event.hasOwnProperty('flow_sid')   , 'missing input event.flow_sid');
  assert (event.hasOwnProperty('appointment'), 'missing input event.appointment');
  assert (event.hasOwnProperty('flow_sid')                          , 'missing input event.flow_sid');
  assert (event.hasOwnProperty('phone')                             , 'missing input event.phone');

  // initialize s3 client
  const s3 = new aws.S3({
    accessKeyId: AWS_ACCESS_KEY_ID,
    secretAccessKey: AWS_SECRET_ACCESS_KEY,
    region: AWS_REGION
  });

    console.log(THIS, 'find active appointments for phone=', event.phone);
    // ----------- find all appointments for patient_id
    let params = {
        Bucket: APPOINTMENTS_S3_BUCKET,
        Key: [
            'state',
            'flow='+TWILIO_FLOW_SID,
            'disposition=QUEUED',
            ''
        ].join('/')
    }
    keys_q = await getAppointmentsByPhone(params, event.phone, s3);

    params = {
        Bucket: APPOINTMENTS_S3_BUCKET,
        Key: [
            'state',
            'flow=' + event.flow_sid,
            'disposition=REMINDED-1',
            ''
        ].join('/')
    }
    keys_r1 = await getAppointmentsByPhone(params, event.phone, s3);

    params = {
        Bucket: APPOINTMENTS_S3_BUCKET,
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
        status: 'found',
        appointment_count: n,
        appointment: appointment
    };
    return callback(null, response);
};
