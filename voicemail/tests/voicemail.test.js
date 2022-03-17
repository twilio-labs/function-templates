let mockedTimeString = '2020-02-13T10:00:00.000Z';
jest.mock('moment', () => {
  const actualMoment = jest.requireActual('moment');
  return () => {
    return actualMoment(mockedTimeString);
  };
});

const helpers = require('../../test/test-helper');
const voicemailFunction = require('../functions/voicemail.protected').handler;
const Twilio = require('twilio');

let context = {};
let event = {};

beforeAll(() => {
  helpers.setup(context);
});

afterEach(() => {
  context = {};
  event = {};
});

afterAll(() => {
  helpers.teardown();
});

test('returns a VoiceResponse', (done) => {
  const callback = (_err, result) => {
    expect(result).toBeInstanceOf(Twilio.twiml.VoiceResponse);
    done();
  };

  voicemailFunction(context, event, callback);
});

test('forwards calls during business hours', (done) => {
  context = {
    PATH: '/demo/voicemail',
    MY_PHONE_NUMBER: '+12223334444',
  };

  const callback = (_err, result) => {
    expect(result.toString()).toMatch(
      '<Response><Dial>+12223334444</Dial></Response>'
    );
    done();
  };

  voicemailFunction(context, event, callback);
});

test('allows to configure business week start', (done) => {
  context = {
    PATH: '/demo/voicemail',
    MY_PHONE_NUMBER: '+12223334444',
    WORK_WEEK_START: 2,
  };

  mockedTimeString = '2020-02-10T18:59:00.000Z';

  const callback = (_err, result) => {
    expect(result.toString()).toMatch(
      '<Response><Say language="en-US" voice="Polly.Joey">Hi there! You are calling after my work hours. Please leave a message after the beep</Say><Record action="/demo/recording"/></Response>'
    );
    done();
  };

  voicemailFunction(context, event, callback);
});

test('allows to configure business hours start', (done) => {
  context = {
    PATH: '/demo/voicemail',
    MY_PHONE_NUMBER: '+12223334444',
    WORK_HOUR_START: 9,
  };

  mockedTimeString = '2020-02-13T08:01:00.000Z';

  const callback = (_err, result) => {
    expect(result.toString()).toMatch(
      '<Response><Say language="en-US" voice="Polly.Joey">Hi there! You are calling after my work hours. Please leave a message after the beep</Say><Record action="/demo/recording"/></Response>'
    );
    done();
  };

  voicemailFunction(context, event, callback);
});

test('allows to configure business week end', (done) => {
  context = {
    PATH: '/demo/voicemail',
    MY_PHONE_NUMBER: '+12223334444',
    WORK_WEEK_END: 4,
  };

  mockedTimeString = '2020-02-14T10:00:00.000Z';

  const callback = (_err, result) => {
    expect(result.toString()).toMatch(
      '<Response><Say language="en-US" voice="Polly.Joey">Hi there! You are calling after my work hours. Please leave a message after the beep</Say><Record action="/demo/recording"/></Response>'
    );
    done();
  };

  voicemailFunction(context, event, callback);
});

test('allows to configure business hours end', (done) => {
  context = {
    PATH: '/demo/voicemail',
    MY_PHONE_NUMBER: '+12223334444',
    WORK_HOUR_END: 16,
  };

  mockedTimeString = '2020-02-13T17:01:00.000Z';

  const callback = (_err, result) => {
    expect(result.toString()).toMatch(
      '<Response><Say language="en-US" voice="Polly.Joey">Hi there! You are calling after my work hours. Please leave a message after the beep</Say><Record action="/demo/recording"/></Response>'
    );
    done();
  };

  voicemailFunction(context, event, callback);
});

test('handles timezone offset', (done) => {
  context = {
    PATH: '/demo/voicemail',
    MY_PHONE_NUMBER: '+12223334444',
    TIMEZONE_OFFSET: '-1',
  };

  mockedTimeString = '2020-02-13T18:59:00.000Z';

  const callback = (_err, result) => {
    expect(result.toString()).toMatch(
      '<Response><Dial>+12223334444</Dial></Response>'
    );
    done();
  };

  voicemailFunction(context, event, callback);
});

test('handles timezone offset outside business hours', (done) => {
  context = {
    PATH: '/demo/voicemail',
    MY_PHONE_NUMBER: '+12223334444',
    TIMEZONE_OFFSET: '-1',
  };

  mockedTimeString = '2020-02-13T08:01:00.000Z';

  const callback = (_err, result) => {
    expect(result.toString()).toMatch(
      '<Response><Say language="en-US" voice="Polly.Joey">Hi there! You are calling after my work hours. Please leave a message after the beep</Say><Record action="/demo/recording"/></Response>'
    );
    done();
  };

  voicemailFunction(context, event, callback);
});

test('sends default message outside of business hours', (done) => {
  context = {
    PATH: '/demo/voicemail',
    MY_PHONE_NUMBER: '+12223334444',
  };

  mockedTimeString = '2020-02-13T19:00:00.000Z';

  const callback = (_err, result) => {
    expect(result.toString()).toMatch(
      '<Response><Say language="en-US" voice="Polly.Joey">Hi there! You are calling after my work hours. Please leave a message after the beep</Say><Record action="/demo/recording"/></Response>'
    );
    done();
  };

  voicemailFunction(context, event, callback);
});

test('sends translated message outside of business hours', (done) => {
  context = {
    PATH: '/demo/voicemail',
    MY_PHONE_NUMBER: '+12223334444',
  };

  event = {
    FromCountry: 'DE',
  };

  mockedTimeString = '2020-02-13T19:00:00.000Z';

  const callback = (_err, result) => {
    expect(result.toString()).toMatch(
      '<Response><Say language="de-DE" voice="Polly.Hans">Hallo! Sie rufen außerhalb meiner Arbeitszeiten an. Bitte hinterlassen Sie mir eine Nachricht nach dem Ton.</Say><Record action="/demo/recording"/></Response>'
    );
    done();
  };

  voicemailFunction(context, event, callback);
});
