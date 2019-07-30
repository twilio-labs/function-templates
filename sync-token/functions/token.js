/**
 *  Sync Token
 *
 *  This Function shows you how to mint Access Tokens for Twilio Sync. Please note, this is for prototyping purposes
 *  only. You will want to validate the identity of clients requesting Access Token in most production applications and set
 *  the identity when minting the Token.
 *
 *  Pre-requisites
 *  - Create a Sync Service (https://www.twilio.com/docs/api/sync/rest/services)
 *   - Create an API Key (https://www.twilio.com/console/runtime/api-keys)
 */

exports.handler = function(context, event, callback) {
  // Change these values for your use case
  // REMINDER: This identity is only for prototyping purposes
  const IDENTITY = 'testing-username';

  const ACCOUNT_SID = context.ACCOUNT_SID;

  // set these values in your .env file
  const API_KEY = context.API_KEY;
  const API_SECRET = context.API_SECRET;
  const SERVICE_SID = context.SYNC_SERVICE_SID || 'enter Sync Service Sid';

  const AccessToken = Twilio.jwt.AccessToken;
  const SyncGrant = AccessToken.SyncGrant;

  const syncGrant = new SyncGrant({
    serviceSid: SERVICE_SID,
  });

  const accessToken = new AccessToken(ACCOUNT_SID, API_KEY, API_SECRET);

  accessToken.addGrant(syncGrant);
  accessToken.identity = IDENTITY;

  const response = new Twilio.Response();

  // Uncomment these lines for CORS support
  // response.appendHeader('Access-Control-Allow-Origin', '*');
  // response.appendHeader('Access-Control-Allow-Methods', 'GET');
  // response.appendHeader('Access-Control-Allow-Headers', 'Content-Type');

  response.appendHeader('Content-Type', 'application/json');
  response.setBody({ token: accessToken.toJwt() });
  callback(null, response);
};
