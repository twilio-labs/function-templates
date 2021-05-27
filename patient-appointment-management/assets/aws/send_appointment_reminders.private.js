const THIS = 'send-appointment-reminders: '

const assert = require('assert');
const AWS = require('aws-sdk');
const twilio = require('twilio');

// --------------------------------------------------------------------------------
async function getAllKeys(params, s3client, allKeys = []){
  const response = await s3client.listObjectsV2(params).promise();
  response.Contents.forEach(obj => allKeys.push(obj.Key));

  if (response.NextContinuationToken) {
    params.ContinuationToken = response.NextContinuationToken;
    await getAllKeys(params, allKeys); // recursive synchronous call
  }
  return allKeys;
}

// --------------------------------------------------------------------------------
//
// Note that exports.handler is changed to 'async' allow use of 'await' to serialize execution.
// Therefore, all asnychronous s3 functions must be called in this function body.
// --------------------------------------------------------------------------------
exports.handler = async function(event, context) {
    console.log('Started', THIS);

    // ---------- validate enviroment variables & input event
    assert(process.env.hasOwnProperty('APPOINTMENTS_S3_BUCKET')      , 'missing process.env.APPOINTMENTS_S3_BUCKET');
    assert(process.env.hasOwnProperty('APPOINTMENT_FILENAME_PATTERN'), 'missing process.env.APPOINTMENT_FILENAME_PATTERN');
    assert(process.env.hasOwnProperty('ACCOUNT_SID')                 , 'missing process.env.ACCOUNT_SID');
    assert(process.env.hasOwnProperty('AUTH_TOKEN')                  , 'missing process.env.AUTH_TOKEN');
    assert(process.env.hasOwnProperty('FLOW_SID')                    , 'missing process.env.FLOW_SID');
    assert(process.env.hasOwnProperty('TWILIO_PHONE_NUMBER')         , 'missing process.env.TWILIO_PHONE_NUMBER');
    assert(process.env.hasOwnProperty('REMINDER_OUTREACH_START')     , 'missing process.env.REMINDER_OUTREACH_START');
    assert(process.env.hasOwnProperty('REMINDER_OUTREACH_FINISH')    , 'missing process.env.REMINDER_OUTREACH_FINISH');
    assert(process.env.hasOwnProperty('REMINDER_FIRST_OFFSET')       , 'missing process.env.REMINDER_FIRST_OFFSET');
    assert(process.env.hasOwnProperty('REMINDER_SECOND_OFFSET')      , 'missing process.env.REMINDER_SECOND_OFFSET');

    // initialize s3 client
    const s3 = new AWS.S3();

    // ---------- set reminder time criteria
    const reminder_outreach_start_tod = process.env.REMINDER_OUTREACH_START;
    const reminder_outreach_finish_tod = process.env.REMINDER_OUTREACH_FINISH;
    const reminder_1st_offset_ms =
      3600*1000*process.env.REMINDER_FIRST_OFFSET.substring(0,2)
      + 60*1000*process.env.REMINDER_FIRST_OFFSET.substring(2,4);
    const reminder_2ndt_offset_ms =
      3600*1000*process.env.REMINDER_FIRST_OFFSET.substring(0,2)
      + 60*1000*process.env.REMINDER_FIRST_OFFSET.substring(2,4);

    console.log('reminder_outreach_start_tod=', reminder_1st_offset_ms);
    console.log('reminder_outreach_finish_tod=', reminder_1st_offset_ms);
    console.log('reminder_1st_offset_ms=', reminder_1st_offset_ms);
    console.log('reminder_2ndt_offset_ms=', reminder_2ndt_offset_ms);

    // ---------- find all appointments in QUEUED & REMINDED-1
    let params = {
        Bucket: process.env.APPOINTMENTS_S3_BUCKET,
        Prefix: [
            'state',
            'flow='+process.env.TWILIO_FLOW_SID,
            'disposition=QUEUED',
            ''
        ].join('/')
    }
    const keys_q = await getAllKeys(params, s3);

    params = {
        Bucket: process.env.APPOINTMENTS_S3_BUCKET,
        Prefix: [
            'state',
            'flow=' + process.env.TWILIO_FLOW_SID,
            'disposition=REMINDED-1',
            ''
        ].join('/')
    }
    const keys_r = await getAllKeys(params, s3);

    const appointment_s3keys = keys_q.concat(keys_r);
    console.log('found queued appointments: ', appointment_s3keys.length);

    let reminder_count = 0;
    for (let i = 0; i < appointment_s3keys.length; i++) {
        const s3key = appointment_s3keys[i];
        console.log('appointment_s3key=', s3key);

        let params = {
            Bucket: process.env.APPOINTMENTS_S3_BUCKET,
            Key: s3key
        }
        let results = await s3.getObject(params).promise();
        let appointment = JSON.parse(results.Body.toString('utf-8'));
        console.log('appointment=', appointment);

        const appointment_ltz = new Date(appointment.appointment_datetime);
        const appointment_tod = appointment_ltz.toISOString().substring(11,13)
          + appointment_ltz.toISOString().substring(14,16);

        if (appointment_tod < reminder_outreach_start_tod) {
            console.log('  skip: appointment_ltz=', appointment_ltz.toISOString(), 'before', reminder_outreach_start_tod);
            continue;
        }
        if (appointment_tod >= reminder_outreach_finish_tod) {
            console.log('  skip: appointment_ltz=', appointment_ltz.toISOString(), 'after', reminder_outreach_finish_tod);
            continue;
        }

        const timezone_offset_milliseconds =
            (appointment.appointment_timezone[0] == '-' ? 1 : -1)
            * (3600*1000*appointment.appointment_timezone.substring(1,3)
               + 60*1000*appointment.appointment_timezone.substring(3,5));
        console.log('  timezone_offset_milliseconds=', timezone_offset_milliseconds);

        const current_utc = new Date();
        console.log('  current     datetime utc=', current_utc);

        const appointment_utc = new Date(new Date(appointment.appointment_datetime).getTime() + timezone_offset_milliseconds);
        console.log('  appointment datetime utc=', appointment_utc);

        const reminder_2_utc  = new Date(appointment_utc.getTime() - reminder_2ndt_offset_ms);
        console.log('  reminder_2  datetime utc=', reminder_2_utc);

        const reminder_1_utc  = new Date(appointment_utc.getTime() - reminder_1st_offset_ms);
        console.log('  reminder_1  datetime utc=', reminder_1_utc);

        const disposition = s3key.includes('QUEUED')
            ? 'QUEUED' : s3key.includes('REMINDED-1')
                ? 'REMINDED-1' : s3key.includes('REMINDED-1')
                    ? 'REMINDED-2' : null;
        if (disposition == null) continue; // error case, skip for now

        if (appointment_utc <= current_utc)
        {
            console.log('  expire: appointment_utc <= current_utc');

            appointment.event_type = 'EXPIRE';

            params = {
                Bucket: process.env.APPOINTMENTS_S3_BUCKET,
                Key: s3key.replace(disposition, 'EXPIRED'),
                Body: JSON.stringify(appointment),
                ServerSideEncryption: 'AES256'
            };
            let results = await s3.putObject(params).promise();
            console.log('  PUT - ', params.Key);

            params = {
                Bucket: process.env.APPOINTMENTS_S3_BUCKET,
                Key: s3key
            }
            results = await s3.deleteObject(params).promise();
            console.log('  DELETE - ', params.Key);

            params = {
                Bucket: process.env.APPOINTMENTS_S3_BUCKET,
                Key: s3key.replace('state', 'history').replace(disposition, 'EXPIRED').replace('.json', new Date().getTime() +'.json'),
                Body: JSON.stringify(appointment),
                ServerSideEncryption: 'AES256'
            };
            results = await s3.putObject(params).promise();
            console.log(THIS, 'PUT - ', params.Key);

            continue;

        }
        else if (reminder_2_utc <= current_utc
            && appointment.event_type != 'CANCELED'
            && appointment.event_type != 'NOSHOW'
            && appointment.event_type != 'OPTED-OUT'
            && appointment.event_type != 'EXPIRE')
        {
            console.log('  send reminder-2: reminder_2_utc <= current_utc');

            params = {
                Bucket: process.env.APPOINTMENTS_S3_BUCKET,
                Key: s3key.replace(disposition, 'REMINDED-2'),
                Body: JSON.stringify(appointment),
                ServerSideEncryption: 'AES256'
            };
            let results = await s3.putObject(params).promise();
            console.log('  PUT - ', params.Key);

            params = {
                Bucket: process.env.APPOINTMENTS_S3_BUCKET,
                Key: s3key
            }
            results = await s3.deleteObject(params).promise();
            console.log('  DELETE - ', params.Key);

            params = {
                Bucket: process.env.APPOINTMENTS_S3_BUCKET,
                Key: s3key.replace('state', 'history').replace(disposition, 'REMINDED-2').replace('.json', new Date().getTime() +'.json'),
                Body: JSON.stringify(appointment),
                ServerSideEncryption: 'AES256'
            };
            results = await s3.putObject(params).promise();
            console.log(THIS, 'PUT - ', params.Key);

        }
        else if (reminder_1_utc <= current_utc
            && appointment.event_type != 'CANCELED'
            && appointment.event_type != 'NOSHOW'
            && appointment.event_type != 'OPTED-OUT'
            && appointment.event_type != 'EXPIRE')
        {
            console.log('  send reminder-1: reminder_1_utc <= current_utc');

            params = {
                Bucket: process.env.APPOINTMENTS_S3_BUCKET,
                Key: s3key.replace(disposition, 'REMINDED-1'),
                Body: JSON.stringify(appointment),
                ServerSideEncryption: 'AES256'
            };
            let results = await s3.putObject(params).promise();
            console.log('  PUT - ', params.Key);

            params = {
                Bucket: process.env.APPOINTMENTS_S3_BUCKET,
                Key: s3key
            }
            results = await s3.deleteObject(params).promise();
            console.log('  DELETE - ', params.Key);

            params = {
                Bucket: process.env.APPOINTMENTS_S3_BUCKET,
                Key: s3key.replace('state', 'history').replace(disposition, 'REMINDED-1').replace('.json', new Date().getTime() +'.json'),
                Body: JSON.stringify(appointment),
                ServerSideEncryption: 'AES256'
            };
            results = await s3.putObject(params).promise();
            console.log(THIS, 'PUT - ', params.Key);

        }
        else
        {
            console.log('  error condition, skipping');

            continue;
        }

        try {

            // ---------- execute twilio studio flow
            const twlo = require('twilio')(process.env.ACCOUNT_SID, process.env.AUTH_TOKEN);

            console.log('  executing twilio flow=', process.env.TWILIO_FLOW_SID);
            reminder_count += 1
            appointment.event_type = 'REMIND';
            params = {
              to: appointment.patient_phone,
              from: process.env.TWILIO_FROM_NUMBER,
              parameters: appointment
            }
            results = await twlo.studio.v1.flows(process.env.TWILIO_FLOW_SID).executions.create(params);
            console.log('  response twilio flow=', results);

        } catch (err) {
            console.log(err, err.stack);
        }
    }
    console.log('Ended', THIS);

    // JSON.stringify('reminders triggered!')
    const response = {
        statusCode: 200,
        body: {
          'reminders_sent': reminder_count,
        }
    };
    return response;
};
