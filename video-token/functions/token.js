/**
 *  Video Token
 *
 *  This Function shows you how to mint Access Tokens for Twilio Video. Please note, this is for prototyping purposes
 *  only. You will want to validate the identity of clients requesting Access Token in most production applications and set
 *  the identity when minting the Token.
 *
 *  Pre-requisites
 *   - Create an API Key (https://www.twilio.com/console/runtime/api-keys)
 */

exports.handler = function(context, event, callback) {
  // Change these values for your use case
  // REMINDER: This identity is only for prototyping purposes
  const IDENTITY = 'testing-username';
  const ROOM = 'myroom';

  const ACCOUNT_SID = context.ACCOUNT_SID;

  // set these values in your .env file
  const API_KEY = context.API_KEY;
  const API_SECRET = context.API_SECRET;

  const AccessToken = Twilio.jwt.AccessToken;
  const VideoGrant = AccessToken.VideoGrant;

  const grant = new VideoGrant();
  grant.room = ROOM;

  const accessToken = new AccessToken(ACCOUNT_SID, API_KEY, API_SECRET);

  accessToken.addGrant(grant);
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
