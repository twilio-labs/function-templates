const TokenValidator = require('twilio-flex-token-validator').functionValidator;

let path = Runtime.getFunctions()['dialpad-utils'].path;
let assets = require(path);

exports.handler = TokenValidator(async (context, event, callback) => {
  const { conference, participant, endConferenceOnExit } = event;

  console.log(
    `Updating participant ${participant} in conference ${conference}`
  );

  const client = context.getTwilioClient();

  const participantResponse = await client
    .conferences(conference)
    .participants(participant)
    .update({
      endConferenceOnExit,
    })
    .catch((e) => {
      console.error(e);
      return {};
    });

  console.log('Participant response properties:');

  Object.keys(participantResponse).forEach((key) => {
    console.log(`${key}: ${participantResponse[key]}`);
  });

  return callback(null, assets.response('json', participantResponse));
});
