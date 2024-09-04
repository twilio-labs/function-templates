const { verifyRequest } = require(Runtime.getAssets()['/utils.js'].path);

/**
 * @param {import('@twilio-labs/serverless-runtime-types/types').Context} context
 * @param {{}} event
 * @param {import('@twilio-labs/serverless-runtime-types/types').ServerlessCallback} callback
 */
exports.handler = async function (context, event, callback) {
  try {
    if (!verifyRequest(context, event)) {
      console.error('Invalid token', event._token);
      return callback(new Error('Invalid token'));
    }

    const client = context.getTwilioClient();
    let from = event.Identity;
    if (from.startsWith('phone:')) {
      from = from.replace('phone:', '');
    }

    const [to] = event.SessionId.replace('webhook:messaging__', '').split('/');
    const body = event.Body;

    const message = await client.messages.create({
      from: to,
      to: from,
      body,
    });

    console.log(`message sent ${message.sid}`);

    return callback(null, {});
  } catch (err) {
    console.error(err);
    return callback(null, {});
  }
};
