exports.handler = function (context, event, callback) {
  const response = new Twilio.Response();

  if (!context.PASSCODE) {
    response.setStatusCode(401);
    response.setBody('Passcode has not yet been generated');
    return callback(null, response);
  }

  if (event.passcode !== context.PASSCODE) {
    response.setStatusCode(401);
    response.setBody('Invalid passcode');
    return callback(null, response);
  }

  if (!event.identity) {
    response.setStatusCode(400);
    response.setBody('Missing "identity" parameter');
    return callback(null, response);
  }

  if (!event.room_name) {
    response.setStatusCode(400);
    response.setBody('Missing "room_name" parameter');
    return callback(null, response);
  }

  const videoGrant = new Twilio.jwt.AccessToken.VideoGrant({
    room: event.room_name,
  });

  const accessToken = new Twilio.jwt.AccessToken(
    context.ACCOUNT_SID,
    context.API_KEY_SID,
    context.API_KEY_SECRET
  );
  accessToken.addGrant(videoGrant);
  accessToken.identity = event.identity;

  return callback(null, {
    token: accessToken.toJwt(),
  });
};
