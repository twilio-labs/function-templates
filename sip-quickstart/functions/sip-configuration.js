const assets = Runtime.getAssets();
const extensions = require(assets['/extensions.js'].path);

exports.handler = async (context, event, callback) => {
  try {
    const client = context.getTwilioClient();
    const sipDomain = await client.sip.domains(context.SIP_DOMAIN_SID).fetch();
    const localizedSipDomainName = sipDomain.domainName.replace(
      '.sip.twilio.com',
      '.sip.us1.twilio.com'
    );
    return callback(null, {
      initialized: context.INITIALIZED,
      appName: context.APP_NAME,
      incomingNumber: context.INCOMING_NUMBER,
      callerId: context.CALLER_ID,
      sipDomainName: sipDomain.domainName,
      extensions,
      localizedSipDomainName,
    });
  } catch (err) {
    return callback(err);
  }
};
