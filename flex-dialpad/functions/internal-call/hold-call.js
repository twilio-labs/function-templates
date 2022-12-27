const TokenValidator = require('twilio-flex-token-validator').functionValidator;

let path = Runtime.getFunctions()['dialpad-utils'].path;
let assets = require(path);

exports.handler = TokenValidator(async (context, event, callback) => {
  console.log('passei por aqui');

  const client = context.getTwilioClient();

  console.log(event);

  const { conference, participant, hold } = event;

  console.log(conference);
  console.log(participant);
  console.log(hold);

  if (conference && participant && hold) {
    console.log('entrei aqui');

    await client.conferences(conference).participants(participant).update({
      hold,
    });
  }

  callback(null, assets.response('json', {}));
});
