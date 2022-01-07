/**
 *  Voice Token
 *
 *  This Function shows you how to mint Access Tokens for the Twilio Voice JavaScript SDK. Please note, this is for prototyping purposes
 *  only. You will want to validate the identity of clients requesting Access Token in most production applications and set
 *  the identity when minting the Token.
 */

exports.handler = function (context, event, callback) {
  // REMINDER: This identity is only for prototyping purposes
  const IDENTITY = 'the_user_id';

  const { ACCOUNT_SID } = context;

  // set these values in your .env file
  const { TWIML_APPLICATION_SID, API_KEY, API_SECRET } = context;

  const { AccessToken } = Twilio.jwt;
  const { VoiceGrant } = AccessToken;

  const accessToken = new AccessToken(ACCOUNT_SID, API_KEY, API_SECRET);
  accessToken.identity = IDENTITY;
  const grant = new VoiceGrant({
    outgoingApplicationSid: TWIML_APPLICATION_SID,
    incomingAllow: true,
  });
  accessToken.addGrant(grant);

  const response = new Twilio.Response();

  /*
   * Uncomment these lines for CORS support
   * response.appendHeader('Access-Control-Allow-Origin', '*');
   * response.appendHeader('Access-Control-Allow-Methods', 'GET');
   * response.appendHeader('Access-Control-Allow-Headers', 'Content-Type');
   */

  response.appendHeader('Content-Type', 'application/json');
  response.setBody({
    identity: IDENTITY,
    token: accessToken.toJwt(),
  });
  callback(null, response);
};
