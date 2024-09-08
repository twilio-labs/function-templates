/*
 * hello-voice.protected.js
 * This file contains an AWS Lambda function handler that generates a Twilio Voice Response. When triggered, it creates a TwiML response that instructs Twilio to speak "Hello World" to the caller. 
 */

// This is an AWS Lambda function handler for a Twilio Voice Response
exports.handler = function (context, event, callback) {
  // Create a new TwiML VoiceResponse object
  const twiml = new Twilio.twiml.VoiceResponse();
  // Add a 'Say' verb to the TwiML response, which will speak the text 'Hello World' to the caller
  twiml.say('Hello World');
  // End the function by calling the callback with the generated TwiML response
  callback(null, twiml);
};
