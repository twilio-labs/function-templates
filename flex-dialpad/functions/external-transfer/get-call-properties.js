const TokenValidator = require('twilio-flex-token-validator').functionValidator;

let path = Runtime.getFunctions()['dialpad-utils'].path;
let assets = require(path);

exports.handler = TokenValidator(async (context, event, callback) => {
  const { callSid } = event;

  console.log(`Getting properties for call SID ${callSid}`);
  const client = context.getTwilioClient();

  const callProperties = await client.calls(callSid).fetch();

  console.log('Call properties:');

  Object.keys(callProperties).forEach((key) => {
    console.log(`${key}: ${callProperties[key]}`);
  });

  callback(null, assets.response('json', callProperties));
});
