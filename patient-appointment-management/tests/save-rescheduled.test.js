/* eslint-disable camelcase */
const helpers = require('../../test/test-helper');
const Twilio = require('twilio');
const { handler } = require('../functions/save-rescheduled.protected');

const context = {
  AWS_ACCESS_KEY_ID: 'YourAWSAccessKeyId',
  AWS_SECRET_ACCESS_KEY: 'YourAWSSecretAccessKey',
  AWS_REGION: 'us-west-2',
  AWS_S3_BUCKET: 'twilio-patient-appointment-management-owlhealth',
  FILENAME_APPOINTMENT: 'appointment{appointment_id}-patient{patient_id}.json',
  TWILIO_FLOW_SID: 'YourStudioFlowSID',
};

// --------------------------------------------------------------------------------
beforeAll(() => {
  global.console = {
    log: jest.fn(),
    debug: console.debug,
    trace: console.trace,
    time: jest.fn(),
    timeEnd: jest.fn(),
    // map other methods that you want to use like console.table
  };
  helpers.setup(context);
  Runtime._addFunction(
    'helpers',
    './patient-appointment-management/functions/helpers.private.js'
  );
});

// --------------------------------------------------------------------------------
afterAll(() => {
  helpers.teardown();
});

// --------------------------------------------------------------------------------
const mockS3DeleteObject = jest.fn();
const mockS3HeadObject = jest.fn();
const mockS3PutObject = jest.fn();
jest.mock('aws-sdk', () => {
  return {
    S3: jest.fn(() => ({
      deleteObject: mockS3DeleteObject,
      headObject: mockS3HeadObject,
      putObject: mockS3PutObject,
    })),
  };
});

// --------------------------------------------------------------------------------
test('normal flow of events', async () => {
  const event = {
    appointment:
      '{' +
      'event_type=RESCHEDULED,' +
      'event_datetime_utc=2021-05-04T19:41:19Z,' +
      'patient_id=1000,' +
      'patient_first_name=Mickey,' +
      'patient_last_name=Mouse,' +
      'patient_phone=+12223334444,' +
      'provider_id=afauci,' +
      'provider_first_name=Anthony,' +
      'provider_last_name=Fauci,' +
      'provider_callback_phone=8001112222,' +
      'appointment_location=Owl Health Clinic,' +
      'appointment_id=2000,' +
      'appointment_timezone=-0700,' +
      'appointment_date=2021-05-05,' +
      'appointment_datetime=2021-05-05T12:00:00.000Z,' +
      'appointment_month=May,' +
      'appointment_day_of_week=Wednesday,' +
      'appointment_time_of_day=12:00 PM' +
      '}',
  };

  mockS3DeleteObject.mockImplementation((params) => {
    return {
      promise: () =>
        Promise.resolve({
          Body: params.Key,
        }),
    };
  });

  mockS3HeadObject.mockImplementation((params) => {
    return {
      promise: () =>
        Promise.resolve({
          Body: params.Key,
        }),
    };
  });

  mockS3PutObject.mockImplementation((params) => {
    return {
      promise: () =>
        Promise.resolve({
          Body: params.Key,
        }),
    };
  });

  const callback = jest.fn();
  await handler(context, event, callback);
  const expected_response = {
    code: 200,
    event_type: 'RESCHEDULED',
    appointment_s3key: `state/flow=${context.TWILIO_FLOW_SID}/disposition=QUEUED/appointment2000-patient1000.json`,
  };
  expect(callback).toHaveBeenCalledWith(null, expected_response);
});

// --------------------------------------------------------------------------------
test('abnormal flow of event: missing event.appointment', async () => {
  const event = {};

  const callback = jest.fn();
  await handler(context, event, callback);
  const expected_response = {
    error: 'ERR_ASSERTION',
    message: 'missing input event.appointment',
  };
  expect(callback).toHaveBeenCalledWith(expected_response);
});

// --------------------------------------------------------------------------------
test('abnormal flow of event: missing appointment.event_type', async () => {
  const event = {
    appointment:
      '{' +
      'patient_id=1000,' +
      'appointment_id=2000,' +
      'appointment_datetime=2021-05-05T12:00:00.000Z' +
      '}',
  };

  const callback = jest.fn();
  await handler(context, event, callback);
  const expected_response = {
    error: 'ERR_ASSERTION',
    message: 'missing appointment.event_type',
  };
  expect(callback).toHaveBeenCalledWith(expected_response);
});

// --------------------------------------------------------------------------------
test('abnormal flow of event: missing appointment.patient_id', async () => {
  const event = {
    appointment:
      '{' +
      'event_type=RESCHEDULED,' +
      'appointment_id=2000,' +
      'appointment_datetime=2021-05-05T12:00:00.000Z' +
      '}',
  };

  const callback = jest.fn();
  await handler(context, event, callback);
  const expected_response = {
    error: 'ERR_ASSERTION',
    message: 'missing appointment.patient_id',
  };
  expect(callback).toHaveBeenCalledWith(expected_response);
});

// --------------------------------------------------------------------------------
test('abnormal flow of event: missing appointment.appointment_id', async () => {
  const event = {
    appointment:
      '{' +
      'event_type=RESCHEDULED,' +
      'patient_id=1000,' +
      'appointment_datetime=2021-05-05T12:00:00.000Z' +
      '}',
  };

  const callback = jest.fn();
  await handler(context, event, callback);
  const expected_response = {
    error: 'ERR_ASSERTION',
    message: 'missing appointment.appointment_id',
  };
  expect(callback).toHaveBeenCalledWith(expected_response);
});

// --------------------------------------------------------------------------------
test('abnormal flow of event: missing appointment.appointment_datetime', async () => {
  const event = {
    appointment:
      '{' +
      'event_type=RESCHEDULED,' +
      'patient_id=1000,' +
      'appointment_id=2000' +
      '}',
  };

  const callback = jest.fn();
  await handler(context, event, callback);
  const expected_response = {
    error: 'ERR_ASSERTION',
    message: 'missing appointment.appointment_datetime',
  };
  expect(callback).toHaveBeenCalledWith(expected_response);
});
