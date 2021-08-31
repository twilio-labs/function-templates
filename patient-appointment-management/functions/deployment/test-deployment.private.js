/* eslint-disable camelcase, object-shorthand */
const THIS = 'test-deployment:';
/*
 * validates deployment
 *
 * Note that applications needs to be fully deployed
 * (i.e., serverless project, studio flow, AWS resources)
 *
 * This can ONLY be run on localhost to overcome the 10sec serverless limit.
 *
 * usage (substitute your test phone number for +12223334444):
 *
 *    curl --silent "http://localhost:3000/deployment/test-deployment?to_number=+12223334444'
 *
 */
const assert = require('assert');
const AWS = require('aws-sdk');

const path0 = Runtime.getFunctions().helpers.path;
const { getParam, setParam } = require(path0);

/*
 * --------------------------------------------------------------------------------
 * make sure this function is same as one in get-datetime-parts function
 * --------------------------------------------------------------------------------
 */
function getDatetimeParts(datetime_iso) {
  const MONTHS = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];
  const DOW = [
    'Sunday',
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
  ];

  const datetime = new Date(Date.parse(datetime_iso));

  const hh =
    datetime.getUTCHours() % 12 === 0 ? 12 : datetime.getUTCHours() % 12;
  const mm = `0${datetime.getUTCMinutes()}`.slice(-2);
  const ampm = datetime.getUTCHours() < 12 ? 'AM' : 'PM';
  const tod = `${hh}:${mm} ${ampm}`;
  const r = {
    year: datetime.getUTCFullYear(),
    month_number: datetime.getUTCMonth() + 1,
    month_name: MONTHS[datetime.getUTCMonth()],
    day: datetime.getUTCDate(),
    day_of_week_long: DOW[datetime.getUTCDay()],
    time_of_day: tod,
    date: datetime_iso.slice(0, 10),
    readable_datetime: null,
  };
  r.readable_datetime = `${r.time_of_day} on ${r.day_of_week_long}, ${r.month_name} ${r.day}, ${r.year}`;

  return r;
}

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
 * returns s3key if found, null otherwise
 * --------------------------------------------------------------------------------
 */
async function findObject(context, params, object_key) {
  let found_key = null;

  const response = await context.S3.listObjectsV2(params).promise();
  response.Contents.some(function (obj) {
    if (obj.Key.endsWith(object_key)) {
      found_key = obj.Key;
      return true; // short-circuit loop if found
    }
    return false;
  });

  if (response.NextContinuationToken) {
    params.ContinuationToken = response.NextContinuationToken;
    result = await findObject(context, params, object_key); // recursive synchronous call
  }
  return found_key;
}

/*
 * --------------------------------------------------------------------------------
 * returns # of objects found under specified params.prefix
 * --------------------------------------------------------------------------------
 */
async function countObjects(context, params) {
  const response = await context.S3.listObjectsV2(params).promise();
  let n = response.Contents.length;

  if (response.NextContinuationToken) {
    params.ContinuationToken = response.NextContinuationToken;
    n += await findObject(context, params, object_key); // recursive synchronous call
  }
  return n;
}

// --------------------------------------------------------------------------------
async function deleteAllObjects(context, params) {
  const response = await context.S3.listObjectsV2(params).promise();
  let n = 0;
  response.Contents.forEach(async function (obj) {
    try {
      const response = await context.S3.deleteObject({
        Bucket: params.Bucket,
        Key: obj.Key,
      }).promise();
      n += 1;
    } catch (err) {
      console.log(err);
    }
  });

  if (response.NextContinuationToken) {
    params.ContinuationToken = response.NextContinuationToken;
    n += await deleteAllObjects(context, params); // recursive synchronous call
  }
  return n;
}

// --------------------------------------------------------------------------------
async function clearAppointmentData(context, bucket) {
  // clear 'state' objects
  let params = {
    Bucket: bucket,
    Prefix: 'state/',
  };
  console.log(`clearing s3://${params.Bucket}/${params.Prefix}`);
  await deleteAllObjects(context, params);

  // clear 'history' objects
  params = {
    Bucket: bucket,
    Prefix: 'history/',
  };
  console.log(`clearing s3://${params.Bucket}/${params.Prefix}`);
  await deleteAllObjects(context, params);
}

/*
 * --------------------------------------------------------------------------------
 * test studio flow using specified appointment data
 *
 * parameters
 *   . context: contains S3, TWILIO_FLOW_SID, AWS_S3_BUCKET
 *   . appointment: appointment event data to run test
 *   . expected: expected results {
 *       step: last flow execution step
 *       n: count of appointment event files in 'history'
 *       key: s3 key of appointment event file in 'state'
 *       appointment: appointment data read from s3
 *     }
 * returns
 * {
 *   result: PASS|FAIL,
 *   output: test output if not matching 'expected' input
 * --------------------------------------------------------------------------------
 */
async function testFlow(context, appointment, expected) {
  // ---------- execute flow
  const now = new Date();
  appointment.event_datetime_utc = now.toISOString();
  let params = {
    to: appointment.patient_phone,
    from: context.TWILIO_PHONE_NUMBER,
    parameters: appointment,
  };
  let response = await context
    .getTwilioClient()
    .studio.flows(context.TWILIO_FLOW_SID)
    .executions.create(params);
  const execution_sid = response.sid;

  // ---------- wait 10 sec to let flow execute
  await new Promise((resolve) => setTimeout(resolve, 10 * 1000));

  // ---------- if still active, stop flow
  response = await context
    .getTwilioClient()
    .studio.flows(context.TWILIO_FLOW_SID)
    .executions(execution_sid)
    .fetch();
  if (response.status === 'active') {
    // if 'active' wait 10 secs and stop flow execution
    await context
      .getTwilioClient()
      .studio.flows(context.TWILIO_FLOW_SID)
      .executions(execution_sid)
      .update({ status: 'ended' });
  }

  // ---------- retrieve flow execution last step
  const steps = await context
    .getTwilioClient()
    .studio.flows(context.TWILIO_FLOW_SID)
    .executions(execution_sid)
    .steps.list({ limit: 1 });

  // ---------- count appointment files in history
  params = {
    Bucket: context.AWS_S3_BUCKET,
    Prefix: `history/flow=${context.TWILIO_FLOW_SID}`,
  };
  const n = await countObjects(context, params);

  // ---------- find appointment file in state
  const filename = context.FILENAME_APPOINTMENT.replace(
    '{appointment_id}',
    appointment.appointment_id
  ).replace('{patient_id}', appointment.patient_id);

  params = {
    Bucket: context.AWS_S3_BUCKET,
    Prefix: `state/flow=${context.TWILIO_FLOW_SID}`,
  };
  const key = await findObject(context, params, filename);

  // ---------- read appointment file in state
  params = {
    Bucket: context.AWS_S3_BUCKET,
    Key: key,
  };
  response = await context.S3.getObject(params).promise();
  const appointment_out = JSON.parse(response.Body.toString('utf-8'));

  const result = {
    step: {
      name: steps[0].name,
      transitionedFrom: steps[0].transitionedFrom,
      transitionTo: steps[0].transitionedTo,
    },
    key: key,
    n: n,
    appointment: {
      event_type: appointment_out.event_type,
    },
  };

  let test_result = null;
  if (JSON.stringify(result) === JSON.stringify(expected)) {
    test_result = `PASS: EHR appointment.event_type=${appointment.event_type}`;
  } else {
    test_result = `FAIL: EHR appointment.event_type=${appointment.event_type}`;
    console.log('expected ----------:', expected);
    console.log('result ----------:', result);
  }
  console.log(test_result);
  return test_result;
}

/*
 * --------------------------------------------------------------------------------
 * test send appointment reminder
 *
 * parameters
 *   . context: contains LAMBDA, AWS_LAMBDA_SEND_REMINDERS, TWILIO_FLOW_SID, S3, AWS_S3_BUCKET
 *   . appointment: appointment event data to run test
 *   . expected: expected results {
 *       step: last flow execution step
 *       n: count of appointment event files in 'history'
 *       key: s3 key of appointment event file in 'state'
 *       appointment: appointment data read from s3
 *     }
 * returns
 * {
 *   result: PASS|FAIL,
 *   output: test output if not matching 'expected' input
 * --------------------------------------------------------------------------------
 */
async function testReminder(context, appointment, expected) {
  // ---------- execute lambda function
  let params = {
    FunctionName: context.AWS_LAMBDA_SEND_REMINDERS,
    InvocationType: 'RequestResponse',
  };
  let response = await context.Lambda.invoke(params).promise();

  // ---------- wait 10 sec to let flow execute
  await new Promise((resolve) => setTimeout(resolve, 10 * 1000));

  // ---------- retrieve last flow execution
  const executions = await context
    .getTwilioClient()
    .studio.flows(context.TWILIO_FLOW_SID)
    .executions.list({ limit: 1 });
  const execution_sid = executions[0].sid;

  // ---------- if still active, stop flow
  response = await context
    .getTwilioClient()
    .studio.flows(context.TWILIO_FLOW_SID)
    .executions(execution_sid)
    .fetch();
  if (response.status === 'active') {
    // if 'active' wait 10 secs and stop flow execution
    await context
      .getTwilioClient()
      .studio.flows(context.TWILIO_FLOW_SID)
      .executions(execution_sid)
      .update({ status: 'ended' });
  }

  // ---------- retrieve flow execution last step
  const steps = await context
    .getTwilioClient()
    .studio.flows(context.TWILIO_FLOW_SID)
    .executions(execution_sid)
    .steps.list({ limit: 1 });

  // ---------- count appointment files in history
  params = {
    Bucket: context.AWS_S3_BUCKET,
    Prefix: `history/flow=${context.TWILIO_FLOW_SID}`,
  };
  const n = await countObjects(context, params);

  // ---------- find appointment file in state
  const filename = context.FILENAME_APPOINTMENT.replace(
    '{appointment_id}',
    appointment.appointment_id
  ).replace('{patient_id}', appointment.patient_id);

  params = {
    Bucket: context.AWS_S3_BUCKET,
    Prefix: `state/flow=${context.TWILIO_FLOW_SID}`,
  };
  const key = await findObject(context, params, filename);

  // ---------- read appointment file in state
  params = {
    Bucket: context.AWS_S3_BUCKET,
    Key: key,
  };
  response = await context.S3.getObject(params).promise();
  const appointment_out = JSON.parse(response.Body.toString('utf-8'));

  const result = {
    step: {
      name: steps[0].name,
      transitionedFrom: steps[0].transitionedFrom,
      transitionTo: steps[0].transitionedTo,
    },
    key: key,
    n: n,
    appointment: {
      event_type: appointment_out.event_type,
    },
  };

  let test_result = null;
  if (JSON.stringify(result) === JSON.stringify(expected)) {
    test_result = 'PASS: AWS send appointment reminder';
  } else {
    test_result = 'FAIL: AWS send appointment reminder';
    console.log('expected ----------:', expected);
    console.log('result ----------:', result);
  }
  console.log(test_result);
  return test_result;
}

/*
 * --------------------------------------------------------------------------------
 * tests 1-way (EHR->Twilio) appointment events
 *
 * --------------------------------------------------------------------------------
 */
async function testEHR2TwilioSMS(context, test_phone_number) {
  const test_results = ['testEHR2TwilioSMS ...'];
  console.log(test_results[0]);

  await clearAppointmentData(context, context.AWS_S3_BUCKET);

  const appt_datetime = new Date();
  const datetime_parts = getDatetimeParts(appt_datetime.toISOString());
  const appt = {
    event_type: 'BOOKED',
    event_datetime_utc: null,
    patient_id: '1000',
    patient_first_name: 'Jane',
    patient_last_name: 'Doe',
    patient_phone: test_phone_number,
    provider_id: 'afauci',
    provider_first_name: 'Anthony',
    provider_last_name: 'Fauci',
    provider_callback_phone: '(800) 111-2222',
    appointment_location: 'Owl Health Clinic',
    appointment_id: '20000',
    appointment_timezone: '-0700',
    appointment_datetime: appt_datetime.toISOString(),
  };

  const test_params = [
    {
      action: 'testFlow',
      event_type: 'BOOKED',
      expected: {
        step: {
          name: 'success',
          transitionedFrom: 'save-booked',
          transitionTo: 'send_booked',
        },
        key: `state/flow=${context.TWILIO_FLOW_SID}/disposition=QUEUED/appointment${appt.appointment_id}-patient${appt.patient_id}.json`,
        n: 1,
        appointment: { event_type: 'BOOKED' },
      },
    },
    {
      action: 'testFlow',
      event_type: 'CANCELED',
      expected: {
        step: {
          name: 'sent',
          transitionedFrom: 'send_canceled',
          transitionTo: 'Ended',
        },
        key: `state/flow=${context.TWILIO_FLOW_SID}/disposition=QUEUED/appointment${appt.appointment_id}-patient${appt.patient_id}.json`,
        n: 2,
        appointment: { event_type: 'CANCELED' },
      },
    },
    {
      action: 'testFlow',
      event_type: 'CONFIRMED',
      expected: {
        step: {
          name: 'sent',
          transitionedFrom: 'send_confirmed',
          transitionTo: 'Ended',
        },
        key: `state/flow=${context.TWILIO_FLOW_SID}/disposition=QUEUED/appointment${appt.appointment_id}-patient${appt.patient_id}.json`,
        n: 3,
        appointment: { event_type: 'CONFIRMED' },
      },
    },
    {
      action: 'testFlow',
      event_type: 'MODIFIED',
      expected: {
        step: {
          name: 'sent',
          transitionedFrom: 'send_modified',
          transitionTo: 'Ended',
        },
        key: `state/flow=${context.TWILIO_FLOW_SID}/disposition=QUEUED/appointment${appt.appointment_id}-patient${appt.patient_id}.json`,
        n: 4,
        appointment: { event_type: 'MODIFIED' },
      },
    },
    {
      action: 'testFlow',
      event_type: 'NOSHOWED',
      expected: {
        step: {
          name: 'sent',
          transitionedFrom: 'send_noshowed',
          transitionTo: 'Ended',
        },
        key: `state/flow=${context.TWILIO_FLOW_SID}/disposition=QUEUED/appointment${appt.appointment_id}-patient${appt.patient_id}.json`,
        n: 5,
        appointment: { event_type: 'NOSHOWED' },
      },
    },
    {
      action: 'testFlow',
      event_type: 'RESCHEDULED',
      expected: {
        step: {
          name: 'sent',
          transitionedFrom: 'send_rescheduled',
          transitionTo: 'Ended',
        },
        key: `state/flow=${context.TWILIO_FLOW_SID}/disposition=QUEUED/appointment${appt.appointment_id}-patient${appt.patient_id}.json`,
        n: 6,
        appointment: { event_type: 'RESCHEDULED' },
      },
    },
  ];

  for (const param of test_params) {
    if (param.action === 'testFlow') {
      appt.event_type = param.event_type;
      const test_result = await testFlow(context, appt, param.expected);
      test_results.push(test_result);
    }
  }

  return test_results;
}

/*
 * --------------------------------------------------------------------------------
 * tests appointment reminder
 *
 * BOOKED (+36 hr), send 1st reminder, send 2nd reminder, no reminder
 *
 * --------------------------------------------------------------------------------
 */
async function testReminderTwoReminders(context, test_phone_number) {
  const test_results = ['testReminderTwoReminders ...'];
  console.log(test_results[0]);

  await clearAppointmentData(context, context.AWS_S3_BUCKET);

  const now = new Date();
  // appointment will be local time, so add 36hrs to now (utc) to be less than 36hrs (24~48) in the future
  const appt_datetime = new Date(now.getTime() + 36 * 60 * 60 * 1000);
  const datetime_parts = getDatetimeParts(appt_datetime.toISOString());
  const appt = {
    event_type: 'BOOKED',
    event_datetime_utc: now.toISOString(),
    patient_id: '1000',
    patient_first_name: 'Jane',
    patient_last_name: 'Doe',
    patient_phone: test_phone_number,
    provider_id: 'afauci',
    provider_first_name: 'Anthony',
    provider_last_name: 'Fauci',
    provider_callback_phone: '(800) 111-2222',
    appointment_location: 'Owl Health Clinic',
    appointment_id: '20000',
    appointment_timezone: '-0700',
    appointment_datetime: appt_datetime.toISOString(),
  };

  const test_params = [
    {
      action: 'testFlow',
      event_type: 'BOOKED',
      expected: {
        step: {
          name: 'success',
          transitionedFrom: 'save-booked',
          transitionTo: 'send_booked',
        },
        key: `state/flow=${context.TWILIO_FLOW_SID}/disposition=QUEUED/appointment${appt.appointment_id}-patient${appt.patient_id}.json`,
        n: 1,
        appointment: { event_type: 'BOOKED' },
      },
    },
    {
      action: 'testReminder',
      expected: {
        step: {
          name: 'success',
          transitionedFrom: 'save-remind',
          transitionTo: 'send_remind',
        },
        key: `state/flow=${context.TWILIO_FLOW_SID}/disposition=REMINDED-1/appointment${appt.appointment_id}-patient${appt.patient_id}.json`,
        n: 2,
        appointment: { event_type: 'REMIND' },
      },
    },
    {
      action: 'testReminder',
      expected: {
        step: {
          name: 'success',
          transitionedFrom: 'save-remind',
          transitionTo: 'send_remind',
        },
        key: `state/flow=${context.TWILIO_FLOW_SID}/disposition=REMINDED-2/appointment${appt.appointment_id}-patient${appt.patient_id}.json`,
        n: 3,
        appointment: { event_type: 'REMIND' },
      },
    },
    {
      action: 'testReminder',
      expected: {
        step: {
          name: 'success',
          transitionedFrom: 'save-remind',
          transitionTo: 'send_remind',
        },
        key: `state/flow=${context.TWILIO_FLOW_SID}/disposition=REMINDED-2/appointment${appt.appointment_id}-patient${appt.patient_id}.json`,
        n: 3,
        appointment: { event_type: 'REMIND' },
      },
    },
  ];

  for (const param of test_params) {
    if (param.action === 'testFlow') {
      appt.event_type = param.event_type;
      const test_result = await testFlow(context, appt, param.expected);
      test_results.push(test_result);
    } else if (param.action === 'testReminder') {
      const test_result = await testReminder(context, appt, param.expected);
      test_results.push(test_result);
    }
  }
  return test_results;
}

/*
 * --------------------------------------------------------------------------------
 * tests appointment reminder
 *
 * BOOKED (+72 hr), no reminder
 *
 * --------------------------------------------------------------------------------
 */
async function testReminderNoReminder(context, test_phone_number) {
  const test_results = ['testReminderNoReminder ...'];
  console.log(test_results[0]);

  await clearAppointmentData(context, context.AWS_S3_BUCKET);

  const now = new Date();
  // appointment will be local time, so add 36hrs to now (utc) to be less than 36hrs (24~48) in the future
  const appt_datetime = new Date(now.getTime() + 72 * 60 * 60 * 1000);
  const datetime_parts = getDatetimeParts(appt_datetime.toISOString());
  const appt = {
    event_type: 'BOOKED',
    event_datetime_utc: now.toISOString(),
    patient_id: '1000',
    patient_first_name: 'Jane',
    patient_last_name: 'Doe',
    patient_phone: test_phone_number,
    provider_id: 'afauci',
    provider_first_name: 'Anthony',
    provider_last_name: 'Fauci',
    provider_callback_phone: '+18001112222',
    appointment_location: 'Owl Health Clinic',
    appointment_id: '20000',
    appointment_timezone: '-0700',
    appointment_datetime: appt_datetime.toISOString(),
  };

  const test_params = [
    {
      action: 'testFlow',
      event_type: 'BOOKED',
      expected: {
        step: {
          name: 'success',
          transitionedFrom: 'save-booked',
          transitionTo: 'send_booked',
        },
        key: `state/flow=${context.TWILIO_FLOW_SID}/disposition=QUEUED/appointment${appt.appointment_id}-patient${appt.patient_id}.json`,
        n: 1,
        appointment: { event_type: 'BOOKED' },
      },
    },
    {
      action: 'testReminder',
      expected: {
        step: {
          name: 'success',
          transitionedFrom: 'save-booked',
          transitionTo: 'send_booked',
        },
        key: `state/flow=${context.TWILIO_FLOW_SID}/disposition=QUEUED/appointment${appt.appointment_id}-patient${appt.patient_id}.json`,
        n: 1,
        appointment: { event_type: 'BOOKED' },
      },
    },
  ];

  for (const param of test_params) {
    if (param.action === 'testFlow') {
      appt.event_type = param.event_type;
      const test_result = await testFlow(context, appt, param.expected);
      test_results.push(test_result);
    } else if (param.action === 'testReminder') {
      const test_result = await testReminder(context, appt, param.expected);
      test_results.push(test_result);
    }
  }
  return test_results;
}

/*
 * --------------------------------------------------------------------------------
 * tests appointment reminder
 *
 * BOOKED (-12 hr), expire
 *
 * --------------------------------------------------------------------------------
 */
async function testReminderExpiration(context, test_phone_number) {
  const test_results = ['testReminderExpiration ...'];
  console.log(test_results[0]);

  await clearAppointmentData(context, context.AWS_S3_BUCKET);

  const now = new Date();
  // appointment will be local time
  const appt_datetime = new Date(now.getTime() - 12 * 60 * 60 * 1000);
  const datetime_parts = getDatetimeParts(appt_datetime.toISOString());
  const appt = {
    event_type: 'BOOKED',
    event_datetime_utc: now.toISOString(),
    patient_id: '1000',
    patient_first_name: 'Jane',
    patient_last_name: 'Doe',
    patient_phone: test_phone_number,
    provider_id: 'afauci',
    provider_first_name: 'Anthony',
    provider_last_name: 'Fauci',
    provider_callback_phone: '+18001112222',
    appointment_location: 'Owl Health Clinic',
    appointment_id: '20000',
    appointment_timezone: '-0700',
    appointment_datetime: appt_datetime.toISOString(),
  };

  const test_params = [
    {
      action: 'testFlow',
      event_type: 'BOOKED',
      expected: {
        step: {
          name: 'success',
          transitionedFrom: 'save-booked',
          transitionTo: 'send_booked',
        },
        key: `state/flow=${context.TWILIO_FLOW_SID}/disposition=QUEUED/appointment${appt.appointment_id}-patient${appt.patient_id}.json`,
        n: 1,
        appointment: { event_type: 'BOOKED' },
      },
    },
    {
      action: 'testReminder',
      expected: {
        step: {
          name: 'success',
          transitionedFrom: 'save-booked',
          transitionTo: 'send_booked',
        },
        key: `state/flow=${context.TWILIO_FLOW_SID}/disposition=EXPIRED/appointment${appt.appointment_id}-patient${appt.patient_id}.json`,
        n: 2,
        appointment: { event_type: 'EXPIRE' },
      },
    },
  ];

  for (const param of test_params) {
    if (param.action === 'testFlow') {
      appt.event_type = param.event_type;
      const test_result = await testFlow(context, appt, param.expected);
      test_results.push(test_result);
    } else if (param.action === 'testReminder') {
      const test_result = await testReminder(context, appt, param.expected);
      test_results.push(test_result);
    }
  }
  return test_results;
}

/*
 * --------------------------------------------------------------------------------
 * to run
 *
 * curl --silent "http://localhost:3000/deployment/test-deployment?token=66NzIRGIvjJBh3B50ZSWN5b/YDY=&to_number=+your_phone_number"
 * --------------------------------------------------------------------------------
 */
exports.handler = async function (context, event, callback) {
  console.time(THIS);
  try {
    assert(
      event.to_number,
      'event.to_number MUST be specified in E.164 format!!!'
    );

    const AWS_CONFIG = {
      accessKeyId: await getParam(context, 'AWS_ACCESS_KEY_ID'),
      secretAccessKey: await getParam(context, 'AWS_SECRET_ACCESS_KEY'),
      region: await getParam(context, 'AWS_REGION'),
    };
    context.S3 = new AWS.S3(AWS_CONFIG);
    context.Lambda = new AWS.Lambda(AWS_CONFIG);
    context.AWS_LAMBDA_SEND_REMINDERS = await getParam(
      context,
      'AWS_LAMBDA_SEND_REMINDERS'
    );
    context.AWS_S3_BUCKET = await getParam(context, 'AWS_S3_BUCKET');
    context.TWILIO_FLOW_SID = await getParam(context, 'TWILIO_FLOW_SID');
    context.FILENAME_APPOINTMENT = await getParam(
      context,
      'FILENAME_APPOINTMENT'
    );

    // studio flow
    if (context.TWILIO_FLOW_SID === null) {
      const err = 'studio flow not deployed!';
      console.log(err);
      throw new Error(err);
    } else {
      console.log('found studio flow:', context.TWILIO_FLOW_SID);
    }

    const cf = new AWS.CloudFormation(AWS_CONFIG);
    // aws bucket cloudformation stack
    try {
      const stack_name = await getParam(context, 'AWS_CF_STACK_BUCKET');
      await cf.describeStacks({ StackName: stack_name }).promise();
      console.log('found bucket cf stack:', stack_name);
    } catch (AmazonCloudFormationException) {
      const err = 'aws bucket cloudformation stack not deployed!';
      console.log(err);
      throw new Error(err);
    }

    // aws application cloudformation stack
    try {
      const stack_name = await getParam(context, 'AWS_CF_STACK_APPLICATION');
      await cf.describeStacks({ StackName: stack_name }).promise();
      console.log('found application cf stack:', stack_name);
    } catch (AmazonCloudFormationException) {
      const err = 'aws application cloudformation stack not deployed!';
      console.log(err);
      throw new Error(err);
    }

    // ---------- clear appointment objects

    let results = [];
    results = results.concat(await testEHR2TwilioSMS(context, event.to_number));
    results = results.concat(
      await testReminderTwoReminders(context, event.to_number)
    );
    results = results.concat(
      await testReminderNoReminder(context, event.to_number)
    );
    results = results.concat(
      await testReminderExpiration(context, event.to_number)
    );

    return callback(null, results);
  } catch (err) {
    console.log(err);
    return callback(err);
  } finally {
    console.timeEnd(THIS);
  }
};
