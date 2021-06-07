const helpers = require('../../test/test-helper');
const Twilio = require('twilio');
const handler = require('../functions/save-response.protected').handler;

const context = {
  'AWS_ACCESS_KEY_ID': 'YourAWSAccessKeyId',
  'AWS_SECRET_ACCESS_KEY': 'YourAWSSecretAccessKey',
  'AWS_REGION': 'us-west-2',
  'AWS_S3_BUCKET': 'twilio-outreach-pcp-followup-owlhealth',
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
  }
  helpers.setup(context);
  Runtime._addFunction('helpers', './functions/helpers.private.js');
  Runtime._addFunction('save-response', './functions/save-response.protected.js');
});

// --------------------------------------------------------------------------------
afterAll(() => {
  helpers.teardown();
});


const mockS3PutObject = jest.fn();
jest.mock('aws-sdk', () => {
  return {
    S3: jest.fn(() => ({
      putObject: mockS3PutObject
    }))
  };
});


// --------------------------------------------------------------------------------
test('normal flow of events',async () => {

  const event = {
    'patient': '{'
      + 'outreach_id=Followup,'
      + 'patient_id=1000,'
      + 'patient_first_name=Mickey,'
      + 'patient_last_name=Mouse,'
      + 'patient_phone=+12223334444'
      + '}',
    'question_id': 'Q1',
    'question': 'Are you happy?',
    'response': 'Y'
  };

  mockS3PutObject.mockImplementation(params => {
    return { promise: () => Promise.resolve({
      Body: params.Key
    })};
  });

  const callback = jest.fn();
  await handler(context, event, callback);
  expect(callback).toHaveBeenCalledWith(
    null, { 'code': 200 }
  );

});


// --------------------------------------------------------------------------------
test('abnormal flow of event: missing event.patient',async () => {

  const event = {
    'question_id': 'Q1',
    'question': 'Are you happy?',
    'response': 'Y'
  };

  const callback = jest.fn();
  await handler(context, event, callback);
  expect(callback).toHaveBeenCalledWith('ERR_ASSERTION', { 'code': 400 });

});


// --------------------------------------------------------------------------------
test('abnormal flow of event: missing event.question_id',async () => {

  const event = {
    'patient': '{'
      + 'outreach_id=Followup,'
      + 'patient_id=1000,'
      + 'patient_first_name=Mickey,'
      + 'patient_last_name=Mouse,'
      + 'patient_phone=+12223334444'
      + '}',
    'question': 'Are you happy?',
    'response': 'Y'
  };

  const callback = jest.fn();
  await handler(context, event, callback);
  expect(callback).toHaveBeenCalledWith('ERR_ASSERTION', { 'code': 400 });

});


// --------------------------------------------------------------------------------
test('abnormal flow of event: missing event.response',async () => {

  const event = {
    'patient': '{'
      + 'outreach_id=Followup,'
      + 'patient_id=1000,'
      + 'patient_first_name=Mickey,'
      + 'patient_last_name=Mouse,'
      + 'patient_phone=+12223334444'
      + '}',
    'question_id': 'Q1',
    'question': 'Are you happy?',
  };

  const callback = jest.fn();
  await handler(context, event, callback);
  expect(callback).toHaveBeenCalledWith('ERR_ASSERTION', { 'code': 400 });

});


// --------------------------------------------------------------------------------
test('abnormal flow of event: missing event.patient.outreach_id',async () => {

  const event = {
    'patient': '{'
      + 'patient_id=1000,'
      + 'patient_first_name=Mickey,'
      + 'patient_last_name=Mouse,'
      + 'patient_phone=+12223334444'
      + '}',
    'question_id': 'Q1',
    'question': 'Are you happy?',
    'response': 'Y'
  };

  const callback = jest.fn();
  await handler(context, event, callback);
  expect(callback).toHaveBeenCalledWith('ERR_ASSERTION', { 'code': 400 });

});


// --------------------------------------------------------------------------------
test('abnormal flow of event: missing event.patient.patient_id',async () => {

  const event = {
    'patient': '{'
      + 'outreach_id=Followup,'
      + 'patient_first_name=Mickey,'
      + 'patient_last_name=Mouse,'
      + 'patient_phone=+12223334444'
      + '}',
    'question_id': 'Q1',
    'question': 'Are you happy?',
    'response': 'Y'
  };

  const callback = jest.fn();
  await handler(context, event, callback);
  expect(callback).toHaveBeenCalledWith('ERR_ASSERTION', { 'code': 400 });

});


