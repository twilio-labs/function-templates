const THIS = 'save-canceled:';
// --------------------------------------------------------------------------------
// event.appointment - flow.data that will be parenthesis enclosed comma-separated
//                     key=value string. Note that values will not be enclosed in quotes.
//                     (eg., {k1=v1, k2=v2, k3=v3} )
//
// . find appointment file in STATE
// . REPLACE in STATE   (disposition as is)
// . PUT     in HISTORY (disposition as is)
// --------------------------------------------------------------------------------
const assert = require('assert');
const aws = require('aws-sdk');
const path   = Runtime.getFunctions()['helpers'].path;
const { retrieveParameter, assignParameter} = require(path);

exports.handler = async function(context, event, callback) {
    // ---------- validate environment variables & input event
    const AWS_ACCESS_KEY_ID            = await retrieveParameter(context, 'AWS_ACCESS_KEY_ID');
    const AWS_SECRET_ACCESS_KEY        = await retrieveParameter(context, 'AWS_SECRET_ACCESS_KEY');
    const AWS_REGION                   = await retrieveParameter(context, 'AWS_REGION');
    const APPOINTMENTS_S3_BUCKET       = await retrieveParameter(context, 'APPOINTMENTS_S3_BUCKET');
    const APPOINTMENT_FILENAME_PATTERN = await retrieveParameter(context, 'APPOINTMENT_FILENAME_PATTERN');
    const FLOW_SID                     = await retrieveParameter(context, 'FLOW_SID');
    assert (event.hasOwnProperty('appointment'), 'missing input event.appointment');

    // initialize s3 client
    const s3 = new aws.S3({
        accessKeyId: AWS_ACCESS_KEY_ID,
        secretAccessKey: AWS_SECRET_ACCESS_KEY,
        region: AWS_REGION
    });

    // convert appointment string to json
    let appointment = {};
    const kv_array = event.appointment.replace('{', '').replace('}', '').split(',');
    kv_array.forEach(function(a) {
      kv = a.split('=');
      appointment[kv[0].trim()] = kv[1].trim();
    });
    assert (appointment.hasOwnProperty('appointment_id')      , 'missing appointment.appointment_id');
    assert (appointment.hasOwnProperty('patient_id')          , 'missing appointment.patient_id');
    assert (appointment.hasOwnProperty('appointment_datetime'), 'missing appointment.appointment_datetime');
    appointment.event_type = 'CANCELED'; // over-ride
    // console.log(THIS, 'appointment=', appointment);

    const state_file_s3key = [
        'state',
        'flow=' + FLOW_SID,
        'disposition={DISPOSITION}',
        APPOINTMENT_FILENAME_PATTERN
          .replace('{appointment_id}', appointment.appointment_id)
          .replace('{patient_id}'    , appointment.patient_id)
    ].join('/');

    // find appointment file
    let disposition = null;
    for (let d of ['QUEUED', 'REMINDED-1', 'REMINDED-2']) {
        try {
            const params = {
                Bucket: APPOINTMENTS_S3_BUCKET,
                Key: state_file_s3key.replace('{DISPOSITION}', d)
            }
            const results = await s3.headObject(params).promise();
            disposition = d;
            break;
        } catch (err) {
            // file not found
        }
    }

    // previous appointment not found, so add
    disposition = disposition == null ? 'QUEUED' : disposition
    const new_state_file_s3key = state_file_s3key.replace('{DISPOSITION}', disposition);

    let params = null;
    try {

        params = {
            Bucket: APPOINTMENTS_S3_BUCKET,
            Key: new_state_file_s3key,
            Body: JSON.stringify(appointment),
            ServerSideEncryption: 'AES256'
        };
        let results = await s3.putObject(params).promise();
        console.log(THIS, 'PUT - ', params.Key);

        params = {
            Bucket: APPOINTMENTS_S3_BUCKET,
            Key: new_state_file_s3key
              .replace('state', 'history')
              .replace('.json', '-' + new Date().getTime() + '.json'),
            Body: JSON.stringify(appointment),
            ServerSideEncryption: 'AES256'
        };
        results = await s3.putObject(params).promise();
        console.log(THIS, 'PUT - ', params.Key);

    } catch (err) {
        console.log(THIS, 'params=', params);
        console.log(err, err.stack);
        callback(err);
    }

    const response = {
        status: 'saved',
        event_type: appointment.event_type,
        appointment_s3key: new_state_file_s3key,
        appointment: appointment
    };
    return callback(null, response);
};
