/**
 * Check Verification
 *
 * Check result of a phone number SNA verification
 *
 * Pre-requisites
 * - Create a Verify Service (https://www.twilio.com/console/verify/services)
 * - Add VERIFY_SERVICE_SID from above to your Environment Variables (https://www.twilio.com/console/functions/configure)
 * - Enable ACCOUNT_SID and AUTH_TOKEN in your functions configuration (https://www.twilio.com/console/functions/configure)
 * Returns JSON
 * {
 *      message: string
 * }
 */

var amqp = require('amqplib/callback_api');

exports.handler = async function (context, event, callback) {
  const response = new Twilio.Response();
  response.appendHeader('Content-Type', 'application/json');

  try {
    const client = context.getTwilioClient();
    const service = context.VERIFY_SERVICE_SID;
    const rabbitmqUrl = context.RABBIT_MQ_URL;

    const [countryCode, phoneNumber] = [event.countryCode, event.phoneNumber];

    // TODO: Check that country code and phone number are present and correct

    /**
     * const check = await client.verify
     * .services(service)
     * .verificationChecks
     * .create({to: countryCode + phoneNumber});
     */

    const check = {
      status: 'approved',
    };

    if (check.status === 'approved') {
      response.setStatusCode(200);
      response.setBody({
        message: 'Phone number verified successfully',
      });

      // Send verification check details to rabbitMQ
      amqp.connect(rabbitmqUrl, function (error0, connection) {
        if (error0) {
          throw error0;
        }
        connection.createChannel(function (error1, channel) {
          if (error1) {
            throw error1;
          }
          var queue = 'verification-checks';

          channel.assertQueue(queue, {
            durable: false,
          });

          channel.sendToQueue(queue, Buffer.from(JSON.stringify(check)));

          return callback(null, response);
        });
        setTimeout(function () {
          connection.close();
          throw new Error('RabbitMQ timeout while sending message to queue');
        }, 500);
      });
    } else {
      throw new Error("Phone number couldn't be verified");
    }
  } catch (error) {
    response.setStatusCode(400);
    response.setBody({
      message: error.message,
    });
    return callback(null, response);
  }
};
