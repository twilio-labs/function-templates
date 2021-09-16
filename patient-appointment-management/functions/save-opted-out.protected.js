/* eslint-disable camelcase */
const THIS = 'save-opted-out:';
/*
 * --------------------------------------------------------------------------------
 * saves appointment opted-out event to s3
 *
 * TODO: Note that functionality wrt opted-out is incomplete
 *
 * event.appointment - flow.data that will be parenthesis enclosed comma-separated
 *                     key=value string. Note that values will not be enclosed in quotes.
 *                     (eg., {k1=v1, k2=v2, k3=v3} )
 *
 * returns
 * . code = 200, if successful
 *
 * . find active appointments for patient_id
 *   . REPLACE in STATE   (disposition=OPTED-OUT)
 *   . PUT     in HISTORY (disposition=OPTED-OUT)
 * --------------------------------------------------------------------------------
 */

// --------------------------------------------------------------------------------
async function getAppointmentsForPatient(
  params,
  patient_id,
  s3client,
  allKeys = []
) {
  const response = await s3client.listObjectsV2(params).promise();
  response.Contents.forEach(function (obj) {
    if (obj.Key.includes(`${patient_id}.json`)) allKeys.push(obj.Key);
  });

  if (response.NextContinuationToken) {
    params.ContinuationToken = response.NextContinuationToken;
    await getAppointmentsForPatient(params, patient_id, s3client, allKeys); // recursive synchronous call
  }
  return allKeys;
}

// --------------------------------------------------------------------------------
exports.handler = async function (context, event, callback) {
  console.log(THIS, 'Begin');
  console.time(THIS);
  try {
    const assert = require('assert');
    const AWS = require('aws-sdk');
    const { path } = Runtime.getFunctions().helpers;
    const { getParam, setParam, validateAppointment } = require(path);

    // ---------- validate environment variables & input event
    const AWS_ACCESS_KEY_ID = await getParam(context, 'AWS_ACCESS_KEY_ID');
    const AWS_SECRET_ACCESS_KEY = await getParam(
      context,
      'AWS_SECRET_ACCESS_KEY'
    );
    const AWS_REGION = await getParam(context, 'AWS_REGION');
    const AWS_S3_BUCKET = await getParam(context, 'AWS_S3_BUCKET');
    const FILENAME_APPOINTMENT = await getParam(
      context,
      'FILENAME_APPOINTMENT'
    );
    const TWILIO_FLOW_SID = await getParam(context, 'TWILIO_FLOW_SID');
    assert(
      event.hasOwnProperty('appointment'),
      'missing input event.appointment'
    );

    // convert appointment (placeholder) string to json
    const appointment = {};
    const kv_array = event.appointment
      .replace('{', '')
      .replace('}', '')
      .split(',');
    kv_array.forEach(function (a) {
      kv = a.split('=');
      appointment[kv[0].trim()] = kv[1].trim();
    });
    assert(
      appointment.hasOwnProperty('event_type'),
      'missing appointment.event_type'
    );
    assert(
      appointment.hasOwnProperty('patient_id'),
      'missing appointment.patient_id'
    );
    validateAppointment(context, appointment);
    appointment.event_type = 'OPTED-OUT'; // over-ride

    // initialize s3 client
    const s3 = new AWS.S3({
      accessKeyId: AWS_ACCESS_KEY_ID,
      secretAccessKey: AWS_SECRET_ACCESS_KEY,
      region: AWS_REGION,
    });

    console.log(
      THIS,
      'find active appointments for patient_id=',
      appointment.patient_id
    );
    // ----------- find all appointments for patient_id
    let params = {
      Bucket: AWS_S3_BUCKET,
      Prefix: [
        'state',
        `flow=${TWILIO_FLOW_SID}`,
        'disposition=QUEUED',
        '',
      ].join('/'),
    };
    keys_q = await getAppointmentsForPatient(
      params,
      appointment.patient_id,
      s3
    );

    params = {
      Bucket: AWS_S3_BUCKET,
      Key: [
        'state',
        `flow=${event.flow_sid}`,
        'disposition=REMINDED-1',
        '',
      ].join('/'),
    };
    keys_r1 = await getAppointmentsForPatient(
      params,
      appointment.patient_id,
      s3
    );

    params = {
      Bucket: AWS_S3_BUCKET,
      Key: [
        'state',
        `flow=${event.flow_sid}`,
        'disposition=REMINDED-2',
        '',
      ].join('/'),
    };
    keys_r2 = await getAppointmentsForPatient(
      params,
      appointment.patient_id,
      s3
    );

    appointment_s3keys = keys_q.concat(keys_r1).concat(keys_r2);
    console.log('found active appointments: ', appointment_s3keys.length);

    for (let i = 0; i < appointment_s3keys.length; i++) {
      const s3key = appointment_s3keys[i];
      console.log('appointment_s3key=', s3key);

      let disposition = null;
      if (s3key.includes('QUEUED')) disposition = 'QUEUED';
      else if (s3key.includes('REMINDED-1')) disposition = 'REMINDED-1';
      else if (s3key.includes('REMINDED-2')) disposition = 'REMINDED-2';
      else disposition = null;
      if (disposition === null) continue; // error case, skip for now

      params = {
        Bucket: AWS_S3_BUCKET,
        Key: s3key,
      };
      let results = await s3.getObject(params).promise();
      const appointment = JSON.parse(results.Body.toString('utf-8'));
      console.log('appointment=', appointment);

      appointment.event_type = 'OPTED-OUT';

      params = {
        Bucket: AWS_S3_BUCKET,
        Key: s3key.replace(disposition, 'OPTED-OUT'),
        Body: JSON.stringify(appointment),
        ServerSideEncryption: 'AES256',
      };
      results = await s3.putObject(params).promise();
      console.log('  PUT - ', params.Key);

      params = {
        Bucket: AWS_S3_BUCKET,
        Key: s3key,
      };
      results = await s3.deleteObject(params).promise();
      console.log('  DELETE - ', params.Key);

      params = {
        Bucket: AWS_S3_BUCKET,
        Key: s3key
          .replace('state', 'history')
          .replace(disposition, 'OPTED-OUT')
          .replace('.json', `${new Date().getTime()}.json`),
        Body: JSON.stringify(appointment),
        ServerSideEncryption: 'AES256',
      };
      results = await s3.putObject(params).promise();
      console.log(THIS, 'PUT - ', params.Key);
    }

    const response = {
      code: 200,
      event_type: appointment.event_type,
      patient_id,
      appointment_count: appointment_s3keys.length,
    };
    return callback(null, response);
  } catch (err) {
    console.log(err);
    if (err.code === 'ERR_ASSERTION')
      return callback({ error: 'ERR_ASSERTION', message: err.message });
    return callback(err);
  } finally {
    console.timeEnd(THIS);
  }
};
