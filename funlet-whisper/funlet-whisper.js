// # Whisper Funlet
// Say a message and optionally request to press a digit (stage 1)
// to check that the recipient is human, and not a voicemail;
// if the check is requested and no digits are pressed, hang up.
// If digits are pressed (stage 2), bridge the call.

// ## Script Parameters

// recording URL or text message to say,
// e.g. asking the recipient to press a key to accept the call
const MY_MESSAGE = fromNumber =>
`You are receiving a call from ${fromNumber}. Press any key to accept.`;

// language code for conversion of text-to-speech messages,
// e.g. 'en' or 'en-gb'
const MY_LANGUAGE = "en";

// voice for text-to-speech messages, one of 'man', 'woman' or 'alice'
const MY_VOICE = "alice";

// whether to request the recipient to press a key to accept the call
const MY_HUMAN_CHECK = false;

// ## Input
exports.input = {};

function getMessage(env, params) {
  const caller = params.From || params.Caller || "";
  return params.Message ||
    env.FUNLET_WHISPER_MESSAGE ||
    MY_MESSAGE( spell(caller) );
}
exports.input.getMessage = getMessage;

function getLanguage(env, params) {
  return params.Language || env.FUNLET_WHISPER_LANGUAGE || MY_LANGUAGE;
}
exports.input.getLanguage = getLanguage;

function getVoice(env, params) {
  return params.Voice || env.FUNLET_WHISPER_VOICE || MY_VOICE;
}
exports.input.getVoice = getVoice;

function isHumanCheckRequired(env, params) {
  if ( typeof params.HumanCheck === "string" ) {
    return params.HumanCheck !== "false";
  }
  if ( typeof env.FUNLET_WHISPER_HUMAN_CHECK === "string" ) {
    return env.FUNLET_WHISPER_HUMAN_CHECK !== "false";
  }
  return MY_HUMAN_CHECK;
}
exports.input.isHumanCheckRequired = isHumanCheckRequired;

function getDigits(env, params) {
  if ( typeof params.Digits === "string" ) {
   return params.Digits;
  }
  return null;
}
exports.input.getDigits = getDigits;

// ## Dependencies
const Twilio = require('twilio');

// ## Output
exports.output = {};

/*
  Function: spell()
  Spell a phone number digit by digit

  Parameter:
    numberString - string, phone number to spell

  Returns:
    string, the original phone number with each digit followed with a pause
    (marked as '. ' for text-to-speech synthesis)
*/
function spell( numberString ) {
  const PAUSE = '. ';
  return numberString.split('').join(PAUSE)+PAUSE;
}
exports.output.spell = spell;

// Copied from Simple Message Funlet
function simpleMessage(response, message, language, voice) {
  if ( message.length === 0 ) {
    return;
  }
  if ( message.startsWith("http") ) {
    response.play({}, message);
  } else {
    response.say({language:language, voice:voice}, message);
  }
}
exports.output.simpleMessage = simpleMessage;

// Copied from Simple Menu Funlet
function gatherDigits(response, maxDigits, message, language, voice) {
  simpleMessage(
    response.gather({numDigits: maxDigits}),
    message,
    language,
    voice
  );
}
exports.output.gatherDigits = gatherDigits;

/*
  Function: whisperStage1()

  Parameters:
    * response - Twilio.twiml.VoiceResponse, Twilio Voice response in progress
    * humanCheck - boolean, whether to request the recipient to press a key
                   to accept the call explicitly
    * message - string, recorded message (URL starting with 'http') to play
                or text message to say
    * language - string, language for text messages, e.g. 'en' for English
                 with an American accent or 'en-gb' for English with a British
                 accent. Use the voice 'alice' for the largest list of
                 supported languages and accents.
    * voice - string, voice for text messages,
              one of 'man', 'woman' or 'alice'.

  Response:
    The input response is modified with instructions to gather one digit and,
    when a human check is requested, to hang up if no digits have been pressed.
*/
function whisperStage1(response, humanCheck, message, language, voice) {
  gatherDigits(response, 1, message, language, voice);
  if ( humanCheck ) {
    response.hangup();
  }
}
exports.output.whisperStage1 = whisperStage1;

/*
  Function: whisperStage2()

  Parameters:
    * response - Twilio.twiml.VoiceResponse, Twilio Voice response in progress
    * digits - string of digits gathered, or null when no digits have been set

  Response:
    The input response is modified with instructions to hang up when an empty
    string of digits has been provided. This is a corner case, which is not
    expected to happen in recent version versions of the Twilio API but has
    been preserved for compatibility with the behavior of the original Twimlet.
    When a digit has been pressed, or when digits have not been set, the
    response is left unchanged.

  Returns:
    boolean, whether digits have been set
*/
function whisperStage2(response, digits) {
  if ( digits === null ) {
    return false;
  }
  if ( digits==="" ) {
    response.hangup();
  }
  return true;
}
exports.output.whisperStage2 = whisperStage2;

exports.handler = function(env, params, reply) {
  const NO_ERROR = null;

  let
    response = new Twilio.twiml.VoiceResponse(),
    digits = getDigits(env, params),
    humanCheckRequired = isHumanCheckRequired(env, params),
    message = getMessage(env, params),
    language = getLanguage(env, params),
    voice = getVoice(env, params);

  if ( !whisperStage2(response, digits) ) {
    whisperStage1(response, humanCheckRequired, message, language, voice);
  }
  reply(NO_ERROR, response);
};
