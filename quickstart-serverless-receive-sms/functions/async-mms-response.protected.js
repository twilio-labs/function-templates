const axios = require('axios');

// Note that the function must be `async` to enable use of the `await` keyword
exports.handler = async (context, event, callback) => {
  // Create a new messaging response object
  const twiml = new Twilio.twiml.MessagingResponse();

  // You can do anything in a Function, including making async requests for data
  const response = await axios
    .get('https://dog.ceo/api/breed/shiba/images/random')
    .catch((error) => {
      /*
       * Be sure to handle any async errors, and return them in callback to end
       * Function execution if it makes sense for your application logic
       */
      console.error(error);
      return callback(error);
    });

  const imageUrl = response.data.message;

  /*
   * Use any of the Node.js SDK methods, such as `message`, to compose a response
   * In this case we're also including the doge image as a media attachment
   * Note: access incoming text details such as the from number on `event`
   */
  twiml.message(`Hello, ${event.From}! Enjoy this doge!`).media(imageUrl);

  /*
   * Return the TwiML as the second argument to `callback`
   * This will render the response as XML in reply to the webhook request
   */
  return callback(null, twiml);
};
