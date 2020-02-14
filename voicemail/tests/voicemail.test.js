let mockedTimeString = 'Thu, 13 Feb 2020 10:00:00 +0000';
jest.mock('moment', () => {
  const actualMoment = jest.requireActual('moment');
  return () => {
    return actualMoment(mockedTimeString);
  };
});

const helpers = require('../../test/test-helper');
const voicemailFunction = require('../functions/voicemail').handler;
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

test('returns a VoiceResponse', done => {
  const callback = (err, result) => {
    expect(result).toBeInstanceOf(Twilio.twiml.VoiceResponse);
    done();
  };

  voicemailFunction(context, event, callback);
});

test('forwards calls during business hours', done => {
  context = {
    PATH: '/demo/voicemail',
    MY_PHONE_NUMBER: '+1112223333',
  };

  const callback = (err, result) => {
    expect(result.toString()).toMatch(
      '<Response><Dial>+1112223333</Dial></Response>'
    );
    done();
  };

  voicemailFunction(context, event, callback);
});

test('allows to configure business week start', done => {
  context = {
    PATH: '/demo/voicemail',
    MY_PHONE_NUMBER: '+1112223333',
    WORK_WEEK_START: 2,
  };

  mockedTimeString = 'Mon, 10 Feb 2020 18:59:00 +0000';

  const callback = (err, result) => {
    expect(result.toString()).toMatch(
      '<Response><Say language="en-US" voice="Polly.Joey">Hi there! You are calling after my work hours. Please leave a message after the beep</Say><Record action="/demo/recording"/></Response>'
    );
    done();
  };

  voicemailFunction(context, event, callback);
});

test('allows to configure business hours start', done => {
  context = {
    PATH: '/demo/voicemail',
    MY_PHONE_NUMBER: '+1112223333',
    WORK_HOUR_START: 9,
  };

  mockedTimeString = 'Thu, 13 Feb 2020 8:01:00 +0000';

  const callback = (err, result) => {
    expect(result.toString()).toMatch(
      '<Response><Say language="en-US" voice="Polly.Joey">Hi there! You are calling after my work hours. Please leave a message after the beep</Say><Record action="/demo/recording"/></Response>'
    );
    done();
  };

  voicemailFunction(context, event, callback);
});

test('allows to configure business week end', done => {
  context = {
    PATH: '/demo/voicemail',
    MY_PHONE_NUMBER: '+1112223333',
    WORK_WEEK_END: 4,
  };

  mockedTimeString = 'Fri, 14 Feb 2020 10:00:00 +0000';

  const callback = (err, result) => {
    expect(result.toString()).toMatch(
      '<Response><Say language="en-US" voice="Polly.Joey">Hi there! You are calling after my work hours. Please leave a message after the beep</Say><Record action="/demo/recording"/></Response>'
    );
    done();
  };

  voicemailFunction(context, event, callback);
});

test('allows to configure business hours end', done => {
  context = {
    PATH: '/demo/voicemail',
    MY_PHONE_NUMBER: '+1112223333',
    WORK_HOUR_END: 16,
  };

  mockedTimeString = 'Thu, 13 Feb 2020 17:01:00 +0000';

  const callback = (err, result) => {
    expect(result.toString()).toMatch(
      '<Response><Say language="en-US" voice="Polly.Joey">Hi there! You are calling after my work hours. Please leave a message after the beep</Say><Record action="/demo/recording"/></Response>'
    );
    done();
  };

  voicemailFunction(context, event, callback);
});

test('handles timezone offset', done => {
  context = {
    PATH: '/demo/voicemail',
    MY_PHONE_NUMBER: '+1112223333',
    TIMEZONE_OFFSET: '-1',
  };

  mockedTimeString = 'Thu, 13 Feb 2020 18:59:00 +0000';

  const callback = (err, result) => {
    expect(result.toString()).toMatch(
      '<Response><Dial>+1112223333</Dial></Response>'
    );
    done();
  };

  voicemailFunction(context, event, callback);
});

test('handles timezone offset outside business hours', done => {
  context = {
    PATH: '/demo/voicemail',
    MY_PHONE_NUMBER: '+1112223333',
    TIMEZONE_OFFSET: '-1',
  };

  mockedTimeString = 'Thu, 13 Feb 2020 8:01:00 +0000';

  const callback = (err, result) => {
    expect(result.toString()).toMatch(
      '<Response><Say language="en-US" voice="Polly.Joey">Hi there! You are calling after my work hours. Please leave a message after the beep</Say><Record action="/demo/recording"/></Response>'
    );
    done();
  };

  voicemailFunction(context, event, callback);
});

test('sends default message outside of business hours', done => {
  context = {
    PATH: '/demo/voicemail',
    MY_PHONE_NUMBER: '+1112223333',
  };

  mockedTimeString = 'Thu, 13 Feb 2020 19:00:00 +0000';

  const callback = (err, result) => {
    expect(result.toString()).toMatch(
      '<Response><Say language="en-US" voice="Polly.Joey">Hi there! You are calling after my work hours. Please leave a message after the beep</Say><Record action="/demo/recording"/></Response>'
    );
    done();
  };

  voicemailFunction(context, event, callback);
});

test('sends translated message outside of business hours', done => {
  context = {
    PATH: '/demo/voicemail',
    MY_PHONE_NUMBER: '+1112223333',
  };

  event = {
    FromCountry: 'DE',
  };

  mockedTimeString = 'Thu, 13 Feb 2020 19:00:00 +0000';

  const callback = (err, result) => {
    expect(result.toString()).toMatch(
      '<Response><Say language="de-DE" voice="Polly.Hans">Hallo! Sie rufen außerhalb meiner Arbeitszeiten an. Bitte hinterlassen Sie mir eine Nachricht nach dem Ton.</Say><Record action="/demo/recording"/></Response>'
    );
    done();
  };

  voicemailFunction(context, event, callback);
});
