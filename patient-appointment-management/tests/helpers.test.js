/* eslint-disable camelcase */
const helpers = require('../../test/test-helper');
const Twilio = require('twilio');
const {
  getParam,
  setParam,
  validateAppointment,
} = require('../functions/helpers.private');

const context = {
  AWS_REGION: 'us-west-2',
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
});

// --------------------------------------------------------------------------------
afterAll(() => {
  helpers.teardown();
});

// --------------------------------------------------------------------------------
test('normal flow of event: getParam', async () => {
  const expected = 'us-west-2';
  const result = await getParam(context, 'AWS_REGION');
  expect(result).toStrictEqual(expected);
});

// --------------------------------------------------------------------------------
test('normal flow of event: getParam', async () => {
  const expected = 'patient-appointment-management';
  const result = await getParam(context, 'APPLICATION_NAME');
  expect(result).toStrictEqual(expected);
});

// --------------------------------------------------------------------------------
test('normal flow of event: validateAppointment typical', async () => {
  const appointment = {
    event_type: 'BOOKED',
    event_datetime_utc: new Date(Date.now()).toISOString(),
    patient_id: '1000',
    patient_first_name: 'Jane',
    patient_last_name: 'Doe',
    patient_phone: '+12223334444',
    provider_id: 'afauci',
    provider_first_name: 'Anthony',
    provider_last_name: 'Fauci',
    provider_callback_phone: '(800) 111-2222',
    appointment_location: 'Owl Health Clinic',
    appointment_id: '20000',
    appointment_timezone: '-0700',
    appointment_datetime: new Date(Date.now()).toISOString(),
  };

  const result = validateAppointment(context, appointment);
  expect(result).toStrictEqual(true);
});

// --------------------------------------------------------------------------------
test('abnormal flow of event: validateAppointment invalid event_type', async () => {
  const appointment = {
    event_type: 'INVALID',
  };

  try {
    const result = validateAppointment(context, appointment);
  } catch (error) {
    return true;
  }
  return false;
});

// --------------------------------------------------------------------------------
test('abnormal flow of event: validateAppointment invalid event_datetime_utc', async () => {
  const appointment = {
    event_type: 'BOOKED',
    event_datetime_utc: new Date().toString(),
  };

  try {
    const result = validateAppointment(context, appointment);
  } catch (error) {
    return true;
  }
  return false;
});

// --------------------------------------------------------------------------------
test('abnormal flow of event: validateAppointment invalid patient_phone', async () => {
  const appointment = {
    event_type: 'BOOKED',
    event_datetime_utc: new Date(Date.now()).toISOString(),
    patient_id: '1000',
    patient_first_name: 'Jane',
    patient_last_name: 'Doe',
    patient_phone: '+US12223334444',
  };

  try {
    const result = validateAppointment(context, appointment);
  } catch (error) {
    return true;
  }
  return false;
});

// --------------------------------------------------------------------------------
test('abnormal flow of event: validateAppointment invalid provider_callback_phone', async () => {
  const appointment = {
    event_type: 'BOOKED',
    event_datetime_utc: new Date(Date.now()).toISOString(),
    patient_id: '1000',
    patient_first_name: 'Jane',
    patient_last_name: 'Doe',
    patient_phone: '+12223334444',
    provider_id: 'afauci',
    provider_first_name: 'Anthony',
    provider_last_name: 'Fauci',
    provider_callback_phone: 'US (800) 111-2222',
  };

  try {
    const result = validateAppointment(context, appointment);
  } catch (error) {
    return true;
  }
  return false;
});

// --------------------------------------------------------------------------------
test('abnormal flow of event: validateAppointment invalid appointment_timezone', async () => {
  const appointment = {
    event_type: 'BOOKED',
    event_datetime_utc: new Date(Date.now()).toISOString(),
    patient_id: '1000',
    patient_first_name: 'Jane',
    patient_last_name: 'Doe',
    patient_phone: '+12223334444',
    provider_id: 'afauci',
    provider_first_name: 'Anthony',
    provider_last_name: 'Fauci',
    provider_callback_phone: '(800) 111-2222',
    appointment_location: 'Owl Health Clinic',
    appointment_id: '20000',
    appointment_timezone: 'PDT',
    appointment_datetime: new Date(Date.now()).toISOString(),
  };

  try {
    const result = validateAppointment(context, appointment);
  } catch (error) {
    return true;
  }
  return false;
});

// --------------------------------------------------------------------------------
test('abnormal flow of event: validateAppointment invalid appointment_datetime', async () => {
  const appointment = {
    event_type: 'BOOKED',
    event_datetime_utc: new Date(Date.now()).toISOString(),
    patient_id: '1000',
    patient_first_name: 'Jane',
    patient_last_name: 'Doe',
    patient_phone: '+12223334444',
    provider_id: 'afauci',
    provider_first_name: 'Anthony',
    provider_last_name: 'Fauci',
    provider_callback_phone: '(800) 111-2222',
    appointment_location: 'Owl Health Clinic',
    appointment_id: '20000',
    appointment_timezone: '-0700',
    appointment_datetime: new Date().toString(),
  };

  try {
    const result = validateAppointment(context, appointment);
  } catch (error) {
    return true;
  }
  return false;
});
