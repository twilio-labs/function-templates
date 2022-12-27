const TokenValidator = require('twilio-flex-token-validator').functionValidator;

let path = Runtime.getFunctions()['dialpad-utils'].path;
let assets = require(path);

exports.handler = TokenValidator(async (context, event, callback) => {
  const { conference, participant } = event;

  console.log(
    `Removing participant ${participant} from conference ${conference}`
  );

  const client = context.getTwilioClient();

  const participantResponse = await client
    .conferences(conference)
    .participants(participant)
    .remove();

  console.log('Participant response properties:');

  Object.keys(participantResponse).forEach((key) => {
    console.log(`${key}: ${participantResponse[key]}`);
  });

  return callback(null, assets.response('json', participantResponse));
});
