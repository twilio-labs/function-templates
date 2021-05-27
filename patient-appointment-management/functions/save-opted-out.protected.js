const THIS = 'save-opted-out:';
// --------------------------------------------------------------------------------
// event.appointment - flow.data that will be parenthesis enclosed comma-separated
//                     key=value string. Note that values will not be enclosed in quotes.
//                     (eg., {k1=v1, k2=v2, k3=v3} )
//
// . find active appointments for patient_id
//   . REPLACE in STATE   (disposition=OPTED-OUT)
//   . PUT     in HISTORY (disposition=OPTED-OUT)
// --------------------------------------------------------------------------------
const assert = require('assert');
const aws = require('aws-sdk');
const path = Runtime.getFunctions()['helpers'].path;
const { retrieveParameter, assignParameter} = require(path);

// --------------------------------------------------------------------------------
async function getAppointmentsForPatient(params, patient_id, s3client, allKeys = []){
    const response = await s3client.listObjectsV2(params).promise();
    response.Contents.forEach(function(obj) {
        if (obj.includes(patient_id + '.json')) allKeys.push(obj.Key);
    });

    if (response.NextContinuationToken) {
        params.ContinuationToken = response.NextContinuationToken;
        await getAllKeys(params, allKeys); // recursive synchronous call
    }
    return allKeys;
}

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

    // convert appointment (placeholder) string to json
    let appointment = {};
    const kv_array = event.appointment.replace('{', '').replace('}', '').split(',');
    kv_array.forEach(function(a) {
      kv = a.split('=');
      appointment[kv[0].trim()] = kv[1].trim();
    });
    assert (appointment.hasOwnProperty('patient_id')          , 'missing appointment.patient_id');
    appointment.event_type = 'OPTED-OUT'; // over-ride
    // console.log(THIS, 'appointment=', appointment);

    console.log(THIS, 'find active appointments for patient_id=', appointment.patient_id);
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
    keys_q = await getAppointmentsForPatient(params, appointment.patient_id, s3);

    params = {
        Bucket: APPOINTMENTS_S3_BUCKET,
        Key: [
            'state',
            'flow=' + event.flow_sid,
            'disposition=REMINDED-1',
            ''
        ].join('/')
    }
    keys_r1 = await getAppointmentsForPatient(params, appointment.patient_id, s3);

    params = {
        Bucket: APPOINTMENTS_S3_BUCKET,
        Key: [
            'state',
            'flow=' + event.flow_sid,
            'disposition=REMINDED-2',
            ''
        ].join('/')
    }
    keys_r2 = await getAppointmentsForPatient(params, appointment.patient_id, s3);

    appointment_s3keys = keys_q.concat(keys_r1).concat(keys_r2);
    console.log('found active appointments: ', appointment_s3keys.length);

    for (let i = 0; i < appointment_s3keys.length; i++) {
        const s3key = appointment_s3keys[i];
        console.log('appointment_s3key=', s3key);

        const disposition =
            s3key.includes('QUEUED') ? 'QUEUED'
            : s3key.includes('REMINDED-1') ? 'REMINDED-1'
            : s3key.includes('REMINDED-2') ? 'REMINDED-2'
            : null;
        if (disposition == null) continue; // error case, skip for now

        try {

            params = {
                Bucket: APPOINTMENTS_S3_BUCKET,
                Key: s3key
            }
            let results = await s3.getObject(params).promise();
            let appointment = JSON.parse(results.Body.toString('utf-8'));
            console.log('appointment=', appointment);

            appointment.event_type = 'OPTED-OUT';

            params = {
                Bucket: APPOINTMENTS_S3_BUCKET,
                Key: s3key.replace(disposition, 'OPTED-OUT'),
                Body: JSON.stringify(appointment),
                ServerSideEncryption: 'AES256'
            };
            results = await s3.putObject(params).promise();
            console.log('  PUT - ', params.Key);

            params = {
                Bucket: APPOINTMENTS_S3_BUCKET,
                Key: s3key
            }
            results = await s3.deleteObject(params).promise();
            console.log('  DELETE - ', params.Key);

            params = {
                Bucket: APPOINTMENTS_S3_BUCKET,
                Key: s3key.replace('state', 'history').replace(disposition, 'OPTED-OUT').replace('.json', new Date().getTime() +'.json'),
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
    }


    const response = {
        status: 'saved',
        event_type: 'OPTED-OUT',
        patient_id: patient_id,
        appointment_count: appointment_s3keys.length
    };
    return callback(null, response);
};
