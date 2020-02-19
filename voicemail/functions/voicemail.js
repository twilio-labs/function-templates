const moment = require('moment');
const url = require('url');

const GREETINGS = {
  _default: {
    text:
      'Hi there! You are calling after my work hours. Please leave a message after the beep',
    language: 'en-US',
    voice: 'Polly.Joey',
  },
  DE: {
    text:
      'Hallo! Sie rufen außerhalb meiner Arbeitszeiten an. Bitte hinterlassen Sie mir eine Nachricht nach dem Ton.',
    language: 'de-DE',
    voice: 'Polly.Hans',
  },
};

const DEFAULT_UTC_OFFSET = 0;
const DEFAULT_WORK_WEEK_START = 1; // Monday
const DEFAULT_WORK_WEEK_END = 5; // Friday
const DEFAULT_WORK_HOUR_START = 8; // 8:00, 8AM
const DEFAULT_WORK_HOUR_END = 18; // 18:59, 6:59PM

function getInteger(stringValue, defaultValue) {
  const parsedNumber = parseInt(stringValue, 10);
  if (isNaN(parsedNumber)) {
    return defaultValue;
  }
  return parsedNumber;
}

exports.handler = function(context, event, callback) {
  const phoneNumberToForwardTo = context.MY_PHONE_NUMBER;
  const timezone = getInteger(context.TIMEZONE_OFFSET, DEFAULT_UTC_OFFSET);
  const workWeek = {
    start: getInteger(context.WORK_WEEK_START, DEFAULT_WORK_WEEK_START),
    end: getInteger(context.WORK_WEEK_END, DEFAULT_WORK_WEEK_END),
  };
  const workHour = {
    start: getInteger(context.WORK_HOUR_START, DEFAULT_WORK_HOUR_START),
    end: getInteger(context.WORK_HOUR_END, DEFAULT_WORK_HOUR_END),
  };

  const currentTime = moment().utcOffset(timezone);
  const hour = currentTime.hour();
  const day = currentTime.day();
  const translatedGreeting = GREETINGS[event.FromCountry];
  const hasTranslatedGreeting = typeof translatedGreeting !== 'undefined';
  // between monday and friday
  const isWorkingDay = day <= workWeek.end && day >= workWeek.start;
  // between 8am and 7pm
  const isWorkingHour = hour <= workHour.end && hour >= workHour.start;

  let twiml = new Twilio.twiml.VoiceResponse();

  if (isWorkingDay && isWorkingHour) {
    twiml.dial(phoneNumberToForwardTo);
  } else {
    if (hasTranslatedGreeting) {
      twiml.say(
        {
          language: translatedGreeting.language,
          voice: translatedGreeting.voice,
        },
        translatedGreeting.text
      );
    } else {
      twiml.say(
        {
          language: GREETINGS._default.language,
          voice: GREETINGS._default.voice,
        },
        GREETINGS._default.text
      );
    }
    twiml.record({
      action: url.resolve(context.PATH, 'recording'),
    });
  }
  callback(null, twiml);
};
