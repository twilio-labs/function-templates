const assets = Runtime.getAssets();
const extensions = require(assets['/extensions.js'].path);
exports.handler = async function (context, event, callback) {
  const twiml = new Twilio.twiml.VoiceResponse();
  if (event.Digits === undefined) {
    twiml
      .gather({ action: './extension-menu' })
      .say(
        'Please enter the extension of your party, or press 0 for a list of all extensions'
      );
  } else if (event.Digits === '0') {
    const gather = twiml.gather({ action: './extension-menu', numDigits: '3' });
    for (const entry of extensions) {
      gather.say(`For ${entry.name}, press ${entry.extension}`);
    }
  } else {
    const client = context.getTwilioClient();
    // Verify context is set up?
    const entry = extensions.find((ext) => ext.extension === event.Digits);
    if (entry) {
      const domain = await client.sip.domains(context.SIP_DOMAIN_SID).fetch();
      const { username } = entry;
      twiml.say(`Connecting to extension ${event.Digits}`);
      const regionalDomainName = domain.domainName.replace(
        'sip.twilio.com',
        'sip.us1.twilio.com'
      );
      twiml.dial().sip(`sip:${username}@${regionalDomainName}`);
    } else {
      twiml.say(`Extension ${event.Digits} is not found`);
      twiml.redirect('./extension-menu');
    }
  }
  return callback(null, twiml);
};
