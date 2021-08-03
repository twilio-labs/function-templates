/* eslint-disable camelcase, complexity, sonarjs/cognitive-complexity, prefer-destructuring, prefer-template */
const THIS = 'send-appointment-reminders: ';
/*
 * --------------------------------------------------------------------------------
 * iterates through pending appointments and sends appointment reminders
 *
 * NOTE: These files are executed on AWS Lambda, updating them here without a redeploy will not change anything.
 * To redeploy run the function /deployment/deploy-aws-code
 * --------------------------------------------------------------------------------
 */

// --------------------------------------------------------------------------------
async function getAllKeys(params, s3client, allKeys = []) {
  const response = await s3client.listObjectsV2(params).promise();
  response.Contents.forEach((obj) => allKeys.push(obj.Key));

  if (response.NextContinuationToken) {
    params.ContinuationToken = response.NextContinuationToken;
    await getAllKeys(params, allKeys); // recursive synchronous call
  }
  return allKeys;
}

/*
 * --------------------------------------------------------------------------------
 * synchronously execute https post
 *
 * params
 * . twilio_flow_sid
 * . twilio_account_sid
 * . twilio_auth_token
 * . to_number
 * . from_number
 * . appointment object
 * --------------------------------------------------------------------------------
 */
async function executeFlow(params) {
  function encode(obj) {
    return Object.keys(obj)
      .map((key) => {
        return `${key}=${encodeURIComponent(obj[key])}`;
      })
      .join('&');
  }

  const https = require('https');

  const auth =
    'Basic ' +
    Buffer.from(
      params.twilio_account_sid + ':' + params.twilio_auth_token
    ).toString('base64');
  console.log(auth);

  const data = {
    To: params.to_number,
    From: params.from_number,
    Parameters: JSON.stringify(params.appointment_object),
  };
  const body = encode(data);

  const options = {
    hostname: 'studio.twilio.com',
    port: 443,
    path: `/v2/Flows/${params.twilio_flow_sid}/Executions`,
    method: 'POST',
    headers: {
      Authorization:
        'Basic ' +
        Buffer.from(
          params.twilio_account_sid + ':' + params.twilio_auth_token
        ).toString('base64'),
      'Content-Type': 'application/x-www-form-urlencoded',
      'Content-Length': body.length,
    },
  };

  return new Promise((resolve, reject) => {
    const request = https.request(options, (response) => {
      console.log(`statusCode: ${response.statusCode}`);

      const data = [];
      response.on('data', (chunk) => {
        data.push(chunk);
      });
      response.on('end', () => {
        resolve(Buffer.concat(data).toString());
      });
      response.on('error', (error) => {
        reject(error);
      });
    });

    request.write(body);
    request.end();
  });
}

// --------------------------------------------------------------------------------
exports.handler = async function (event, context) {
  console.time(THIS);
  try {
    const assert = require('assert');
    const AWS = require('aws-sdk');

    // initialize AWS client
    const s3 = new AWS.S3();

    // SecretsManager client requires region to be specified
    const SM = new AWS.SecretsManager({ region: process.env.AWS_REGION });
    const data = await SM.getSecretValue({
      SecretId: process.env.TWILIO_SECRET_ARN,
    }).promise();
    const secret = JSON.parse(data.SecretString);

    // ---------- environment variables & input event
    const AWS_S3_BUCKET = process.env.AWS_S3_BUCKET;
    const FILENAME_APPOINTMENT = process.env.FILENAME_APPOINTMENT;
    const ACCOUNT_SID = secret.ACCOUNT_SID;
    const AUTH_TOKEN = secret.AUTH_TOKEN;
    const TWILIO_FLOW_SID = process.env.TWILIO_FLOW_SID;
    const TWILIO_PHONE_NUMBER = process.env.TWILIO_PHONE_NUMBER;
    const REMINDER_OUTREACH_START = process.env.REMINDER_OUTREACH_START;
    const REMINDER_OUTREACH_FINISH = process.env.REMINDER_OUTREACH_FINISH;
    const REMINDER_FIRST_TIMING = process.env.REMINDER_FIRST_TIMING;
    const REMINDER_SECOND_TIMING = process.env.REMINDER_SECOND_TIMING;

    // ---------- set reminder time criteria
    const reminder_outreach_finish_tod = REMINDER_OUTREACH_FINISH;
    const reminder_1st_offset_ms =
      3600 * 1000 * REMINDER_FIRST_TIMING.substring(0, 2) +
      60 * 1000 * REMINDER_FIRST_TIMING.substring(2, 4);
    const reminder_2nd_offset_ms =
      3600 * 1000 * REMINDER_SECOND_TIMING.substring(0, 2) +
      60 * 1000 * REMINDER_SECOND_TIMING.substring(2, 4);

    console.log(`REMINDER_OUTREACH_START = ${REMINDER_OUTREACH_START}`);
    console.log(`REMINDER_OUTREACH_FINISH= ${REMINDER_OUTREACH_FINISH}`);
    console.log(
      `REMINDER_FIRST_TIMING = ${REMINDER_FIRST_TIMING} (${reminder_1st_offset_ms})`
    );
    console.log(
      `REMINDER_SECOND_TIMING= ${REMINDER_SECOND_TIMING} (${reminder_2nd_offset_ms})`
    );

    // ---------- find all appointments in QUEUED & REMINDED-1
    let params = {
      Bucket: AWS_S3_BUCKET,
      Prefix: [
        'state',
        `flow=${TWILIO_FLOW_SID}`,
        'disposition=QUEUED',
        '',
      ].join('/'),
    };
    const keys_q = await getAllKeys(params, s3);

    params = {
      Bucket: AWS_S3_BUCKET,
      Prefix: [
        'state',
        `flow=${TWILIO_FLOW_SID}`,
        'disposition=REMINDED-1',
        '',
      ].join('/'),
    };
    const keys_r = await getAllKeys(params, s3);

    const appointment_s3keys = keys_q.concat(keys_r);
    console.log('found queued appointments: ', appointment_s3keys.length);

    let reminder_count = 0;
    for (let i = 0; i < appointment_s3keys.length; i++) {
      const s3key = appointment_s3keys[i];
      console.log('appointment_s3key=', s3key);

      let params = {
        Bucket: AWS_S3_BUCKET,
        Key: s3key,
      };
      const results = await s3.getObject(params).promise();
      const appointment = JSON.parse(results.Body.toString('utf-8'));
      console.log('appointment=', appointment);

      const appointment_ltz = new Date(appointment.appointment_datetime);
      const appointment_tod =
        appointment_ltz.toISOString().substring(11, 13) +
        appointment_ltz.toISOString().substring(14, 16);

      if (
        appointment_tod >= REMINDER_OUTREACH_START &&
        appointment_tod < REMINDER_OUTREACH_FINISH
      ) {
        console.log('appointment time-of-day within outreach window');
      } else {
        console.log(
          'appointment time-of-day outside outreach window, skipping'
        );
        continue;
      }

      const timezone_offset_milliseconds =
        (appointment.appointment_timezone[0] === '-' ? 1 : -1) *
        (3600 * 1000 * appointment.appointment_timezone.substring(1, 3) +
          60 * 1000 * appointment.appointment_timezone.substring(3, 5));
      console.log(
        '  timezone_offset_milliseconds=',
        timezone_offset_milliseconds
      );

      const current_utc = new Date();
      console.log('current     datetime utc=', current_utc);

      const appointment_utc = new Date(
        new Date(appointment.appointment_datetime).getTime() +
          timezone_offset_milliseconds
      );
      console.log('appointment datetime utc=', appointment_utc);

      const reminder_2_utc = new Date(
        appointment_utc.getTime() - reminder_2nd_offset_ms
      );
      console.log('reminder_2  datetime utc=', reminder_2_utc);

      const reminder_1_utc = new Date(
        appointment_utc.getTime() - reminder_1st_offset_ms
      );
      console.log('reminder_1  datetime utc=', reminder_1_utc);

      let disposition = null;
      if (s3key.includes('QUEUED')) disposition = 'QUEUED';
      else if (s3key.includes('REMINDED-1')) disposition = 'REMINDED-1';
      else if (s3key.includes('REMINDED-2')) disposition = 'REMINDED-2';
      else disposition = null;
      if (disposition === null) continue; // error case, skip for now

      if (current_utc >= appointment_utc) {
        console.log('expire: current_utc >= appointment_utc');

        appointment.event_type = 'EXPIRE';

        params = {
          Bucket: AWS_S3_BUCKET,
          Key: s3key.replace(disposition, 'EXPIRED'),
          Body: JSON.stringify(appointment),
          ServerSideEncryption: 'AES256',
        };
        let results = await s3.putObject(params).promise();
        console.log('PUT - ', params.Key);

        params = {
          Bucket: AWS_S3_BUCKET,
          Key: s3key,
        };
        results = await s3.deleteObject(params).promise();
        console.log('DELETE - ', params.Key);

        params = {
          Bucket: AWS_S3_BUCKET,
          Key: s3key
            .replace('state', 'history')
            .replace(disposition, 'EXPIRED')
            .replace('.json', `${new Date().getTime()}.json`),
          Body: JSON.stringify(appointment),
          ServerSideEncryption: 'AES256',
        };
        results = await s3.putObject(params).promise();
        console.log('PUT - ', params.Key);

        continue;
      } else if (current_utc < reminder_1_utc) {
        console.log('not ready: current_utc < reminder_1_utc');

        continue;
      } else if (
        current_utc < reminder_2_utc &&
        current_utc >= reminder_1_utc &&
        appointment.event_type !== 'CANCELED' &&
        appointment.event_type !== 'NOSHOWED' &&
        appointment.event_type !== 'OPTED-OUT' &&
        appointment.event_type !== 'EXPIRE'
      ) {
        console.log(
          'send reminder-1: reminder_1_utc <= current_utc < reminder_2_utc'
        );

        appointment.event_type = 'REMIND';
      } else if (
        current_utc < appointment_utc &&
        current_utc >= reminder_2_utc &&
        appointment.event_type !== 'CANCELED' &&
        appointment.event_type !== 'NOSHOWED' &&
        appointment.event_type !== 'OPTED-OUT' &&
        appointment.event_type !== 'EXPIRE'
      ) {
        console.log(
          'send reminder-2: reminder_2_utc <= current_utc < appointment_utc'
        );

        appointment.event_type = 'REMIND';
      } else {
        console.log('skipping: error condition');

        continue;
      }

      try {
        // ---------- execute twilio studio flow
        console.log(
          'send reminder for appointment=',
          appointment.appointment_id
        );
        const params = {
          twilio_flow_sid: TWILIO_FLOW_SID,
          twilio_account_sid: ACCOUNT_SID,
          twilio_auth_token: AUTH_TOKEN,
          to_number: appointment.patient_phone,
          from_number: TWILIO_PHONE_NUMBER,
          appointment_object: appointment,
        };
        await executeFlow(params);
        reminder_count += 1;
      } catch (err) {
        console.log(err, err.stack);
        continue;
      }
    }

    // JSON.stringify('reminders triggered!')
    return {
      statusCode: 200,
      body: {
        reminders_sent: reminder_count,
      },
    };
  } catch (err) {
    console.log(err);
    return { statusCode: 400, message: err.message };
  } finally {
    console.timeEnd(THIS);
  }
};
