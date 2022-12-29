const TokenValidator = require('twilio-flex-token-validator').functionValidator;

let path = Runtime.getFunctions()['dialpad-utils'].path;
let assets = require(path);

exports.handler = TokenValidator(async (context, event, callback) => {
  const { taskSid, to, from } = event;

  console.log(`Adding ${to} to named conference ${taskSid}`);

  const client = context.getTwilioClient();

  const participantsResponse = await client
    .conferences(taskSid)
    .participants.create({
      to,
      from,
      earlyMedia: true,
      endConferenceOnExit: false,
    });

  console.log('Participant response properties:');

  Object.keys(participantsResponse).forEach((key) => {
    console.log(`${key}: ${participantsResponse[key]}`);
  });

  callback(null, assets.response('json', participantsResponse));
});
