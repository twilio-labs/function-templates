/* eslint-disable camelcase */
const helpers = require('../../test/test-helper');
const Twilio = require('twilio');
const { getParam, setParam } = require('../functions/helpers.private');

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
