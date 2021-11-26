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

const { createCORSResponse } = require('@twilio-labs/runtime-helpers').response;

exports.handler = function (context, event, callback) {
  /*
   * Change these values for your use case
   * REMINDER: This identity is only for prototyping purposes
   */
  const IDENTITY = 'testing-username';

  const { ACCOUNT_SID } = context;

  // set these values in your .env file
  const { API_KEY, API_SECRET } = context;
  const SERVICE_SID = context.SYNC_SERVICE_SID || 'enter Sync Service Sid';

  const { AccessToken } = Twilio.jwt;
  const { SyncGrant } = AccessToken;

  const syncGrant = new SyncGrant({
    serviceSid: SERVICE_SID,
  });

  const accessToken = new AccessToken(ACCOUNT_SID, API_KEY, API_SECRET);

  accessToken.addGrant(syncGrant);
  accessToken.identity = IDENTITY;

  // set to true to support CORS
  const supportCors = false;
  /* istanbul ignore next */
  const response = supportCors
    ? createCORSResponse('*')
    : new Twilio.Response();

  response.appendHeader('Content-Type', 'application/json');
  response.setBody({ token: accessToken.toJwt() });
  callback(null, response);
};
