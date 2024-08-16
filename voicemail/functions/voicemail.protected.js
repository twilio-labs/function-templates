/**
 * Call Forwarding with Voicemail
 *
 * Description:
 * This file contains the main Twilio Function that forwards
 * incoming calls to a specific phone number during a set work
 * hours and records voicemail for calls that are unanswered or
 * outside of the work hours.
 *
 * Contents:
 * 1. Dependencies
 * 2. Configuration
 * 3. Helper Function
 * 4. Main Handler
 */

/**
 * 1. Dependencies
 *  These dependecies will be used in the main handler to assist
 *  in formatting the date and forwaring URL for the recorded voicemail.
 */

const moment = require('moment');
const url = require('url');

/*
 * 2. Configuration
 *
 * Contains greeting messages which is spoken when a call
 * is received out of work hours. Here you can change the default
 * greetings, voice types, and add addional greetings for specified languages.
 *
 * The function chooses the greeting based on the FromCountry parameter provided
 * by Twilio when the call request is sent to the function.
 *
 * You can also change the default UTC time offset, work hours
 * start and end times, start and end days of the work week.
 * These values are only used if they arent specified in /.env.
 *
 */

const GREETINGS = {
  // default greeting if there isn't one set for the callers FromCountry parameter
  _default: {
    // message that is spoken to the caller
    text: 'Hi there! You are calling after my work hours. Please leave a message after the beep',

    // language code for conversion of text-to-speech messages, e.g. 'en' or 'en-gb'
    language: 'en-US',

    // voice for text-to-speech messages, one of 'man', 'woman' or any supported Amazon Polly or Google voices
    voice: 'Polly.Joey',
  },
  DE: {
    text: 'Hallo! Sie rufen außerhalb meiner Arbeitszeiten an. Bitte hinterlassen Sie mir eine Nachricht nach dem Ton.',
    language: 'de-DE',
    voice: 'Polly.Hans',
  },
};

/*
 * default values to be used if they aren't provided as environment variables
 * in /.env.
 */
const DEFAULT_UTC_OFFSET = 0;
const DEFAULT_WORK_WEEK_START = 1; // Monday
const DEFAULT_WORK_WEEK_END = 5; // Friday
const DEFAULT_WORK_HOUR_START = 8; // 8:00, 8AM
const DEFAULT_WORK_HOUR_END = 18; // 18:59, 6:59PM

/*
 * 2. Helper Function
 *
 * Helper function to parse string values to integers.
 * Returns default value if string cannot parsed to an integer.
 *
 * stringValue - value to be converted into an integer
 * defaultValue - default value to return if stringValue
 * can't be parse into integer
 */

function parseInteger(stringValue, defaultValue) {
  const parsedNumber = parseInt(stringValue, 10);
  if (isNaN(parsedNumber)) {
    return defaultValue;
  }
  return parsedNumber;
}

/*
 * 3. Main Handler
 *
 * This is the entry point to your Twilio Function,
 * which will create a new Voice Response using Twiml based on
 * the current time and defined work hours. If the call is
 * during work hours the Voice Response will forward the call
 * and dial the MY_PHONE_NUMBER specified in /.env.
 * If the call is placed outside work hours, the Voice Response
 * will respond to the caller with a greeting and will record a voicemail
 * which will be forwarded to the recording function in recording.js.
 *
 * The callback will be used to return from your function
 * with the Twiml Voice Response you defined earlier.
 * In the callback in non-error situations, the first
 * parameter is null and the second parameter
 * is the value you want to return.
 */

exports.handler = function (context, event, callback) {
  // parse the environment variables and get the work hours and timezone
  const phoneNumberToForwardTo = context.MY_PHONE_NUMBER;
  const timezone = parseInteger(context.TIMEZONE_OFFSET, DEFAULT_UTC_OFFSET);
  const workWeek = {
    start: parseInteger(context.WORK_WEEK_START, DEFAULT_WORK_WEEK_START),
    end: parseInteger(context.WORK_WEEK_END, DEFAULT_WORK_WEEK_END),
  };
  const workHour = {
    start: parseInteger(context.WORK_HOUR_START, DEFAULT_WORK_HOUR_START),
    end: parseInteger(context.WORK_HOUR_END, DEFAULT_WORK_HOUR_END),
  };

  // calculate the current day and time according to the timezone
  const currentTime = moment().utcOffset(timezone);
  const hour = currentTime.hour();
  const day = currentTime.day();

  // check if there is a translated greeting for callers country
  const translatedGreeting = GREETINGS[event.FromCountry];
  const hasTranslatedGreeting = typeof translatedGreeting !== 'undefined';

  // between monday and friday
  const isWorkingDay = day <= workWeek.end && day >= workWeek.start;
  // between 8am and 7pm
  const isWorkingHour = hour <= workHour.end && hour >= workHour.start;

  // create a new TwiML response
  const twiml = new Twilio.twiml.VoiceResponse();

  /*
   * If the current time is within work hours, forward the call to the specified phone number.
   * Else play the greeting message and begin recording for a voicemail message.
   */
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
  // return the generated Twilio Voice Response
  callback(null, twiml);
};
