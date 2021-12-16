exports.handler = function (context, event, callback) {
  const VALID_PASSCODE = context.PASSCODE;
  const { ROOM_NAME } = context;
  const TWILIO_ACCOUNT_SID = context.ACCOUNT_SID;
  const TWILIO_API_KEY = context.API_KEY;
  const TWILIO_API_SECRET = context.API_SECRET;
  const ACCESS_TOKEN_IDENTITY =
    Math.random().toString(36).substring(2, 15) +
    Math.random().toString(36).substring(2, 15); // random client name

  if (event.passcode !== VALID_PASSCODE) {
    const response = new Twilio.Response();
    response.setStatusCode(401);
    response.setBody('Invalid passcode');
    return callback(null, response);
  }

  const { AccessToken } = Twilio.jwt;
  const { VideoGrant } = AccessToken;
  /*
   * only tokens are available for participating rooms
   * Create a Video grant enabling client to use Video, only for this room
   */
  const videoGrant = new VideoGrant({
    room: ROOM_NAME,
  });
  // Create an access token to sign and return to the client with the grant we just created
  const accessToken = new AccessToken(
    TWILIO_ACCOUNT_SID,
    TWILIO_API_KEY,
    TWILIO_API_SECRET
  );
  accessToken.addGrant(videoGrant); // Add the grant to the token
  accessToken.identity = ACCESS_TOKEN_IDENTITY;
  return callback(null, {
    token: accessToken.toJwt(), // Serialize the token to a JWT string
    room: ROOM_NAME,
  });
};
