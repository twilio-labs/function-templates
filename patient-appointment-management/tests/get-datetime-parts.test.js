/* eslint-disable camelcase */
const helpers = require('../../test/test-helper');
const Twilio = require('twilio');
const { handler } = require('../functions/get-datetime-parts.protected');

const context = {};

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
test('normal flow of event: 2021-11-12T13:15:00Z', async () => {
  const event = {
    datetime_iso: '2021-11-12T13:15:00Z',
  };

  const callback = jest.fn();
  await handler(context, event, callback);
  const expected_response = {
    year: 2021,
    month_number: 11,
    month_name: 'November',
    day: 12,
    day_of_week_long: 'Friday',
    time_of_day: '1:15 PM',
    readable_datetime: '1:15 PM on Friday, November 12, 2021',
  };
  expect(callback).toHaveBeenCalledWith(null, expected_response);
});

// --------------------------------------------------------------------------------
test('normal flow of event: 2021-11-12T13:15:00Z', async () => {
  const event = {
    datetime_iso: '2021-01-02T06:04:00Z',
  };

  const callback = jest.fn();
  await handler(context, event, callback);
  const expected_response = {
    year: 2021,
    month_number: 1,
    month_name: 'January',
    day: 2,
    day_of_week_long: 'Saturday',
    time_of_day: '6:04 AM',
    readable_datetime: '6:04 AM on Saturday, January 4, 2021',
  };
  expect(callback).toHaveBeenCalledWith(null, expected_response);
});
