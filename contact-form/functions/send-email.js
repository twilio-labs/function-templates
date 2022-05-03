const sg = require('@sendgrid/mail');

function errorResponse(response, message) {
  response.setStatusCode(400);
  response.setBody({ success: false, error: message });
  return response;
}

exports.handler = async function (context, event, callback) {
  const response = new Twilio.Response();
  response.appendHeader('Content-Type', 'application/json');
  /*
   * Set the CORS headers to access this function from a different origin
   * response.appendHeader("Access-Control-Allow-Origin", "*");
   * response.appendHeader("Access-Control-Allow-Methods", "OPTIONS, POST, GET");
   * response.appendHeader("Access-Control-Allow-Headers", "Content-Type");
   */
  if (typeof event.from === 'undefined' || event.from.trim() === '') {
    return callback(
      null,
      errorResponse(response, "Please set a 'from' email.")
    );
  }
  if (typeof event.content === 'undefined' || event.content.trim() === '') {
    return callback(
      null,
      errorResponse(response, 'Please enter some content for the email.')
    );
  }
  sg.setApiKey(context.SENDGRID_API_KEY);
  const msg = {
    to: context.TO_EMAIL_ADDRESS,
    from: { email: context.FROM_EMAIL_ADDRESS, name: 'Your contact form' },
    replyTo: event.from,
    subject: `[contactform] ${event.subject || ''}`.trim(),
    text: `New email from ${event.from}.\n\n${event.content}`,
  };

  try {
    await sg.send(msg);
    response.setStatusCode(200);
    response.setBody({ success: true });
    return callback(null, response);
  } catch (error) {
    console.error(error);
    let { message } = error;
    if (error.response) {
      console.error(error.response.body);
      message = error.response.body.errors[0];
    }
    return callback(null, errorResponse(response, message));
  }
};
