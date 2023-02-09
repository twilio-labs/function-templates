/* eslint-disable camelcase */
const getCustomerProxyAddress = (context, channelName) => {
  /**
   * if you are also using whatsapp,
   * you can add the TWILIO_WHATSAPP_NUMBER
   * environment variable and use the following code:
   * if (channelName === 'whatsapp') {
   *   return context.TWILIO_WHATSAPP_NUMBER;
   * }
   */

  if (channelName === 'sms') {
    return context.TWILIO_PHONE_NUMBER;
  }
  return null;
};

const handleGetProxyAddress = (context, event, callback) => {
  const channelName = event.ChannelType;

  const proxyAddress = getCustomerProxyAddress(context, channelName);

  /**
   * In order to start a new conversation the Conversations API needs a proxy address.
   * This is the number from which the message is sent
   */
  if (proxyAddress) {
    const resp = { proxy_address: proxyAddress };
    return callback(null, resp);
  }
  const response = new Twilio.Response();
  response.setStatusCode(403);
  response.setBody('Proxy address not found');

  return callback(null, response);
};

/**
 * Outgoing Conversation Callback Handler.
 * Read more: https://www.twilio.com/docs/frontline/outgoing-conversations
 */
exports.handler = async function (context, event, callback) {
  console.log('[ Outgoing Conversation Callback ]');

  /**
   * Location helps to determine which information was requested.
   * This callback is used to fetch different types of information.
   * Read more: https://www.twilio.com/docs/frontline/outgoing-conversations#getproxyaddress
   */
  const location = event.Location;

  if (location === 'GetProxyAddress') {
    return handleGetProxyAddress(context, event, callback);
  }

  const response = new Twilio.Response();
  response.setStatusCode(422);
  response.setBody(`Unknown location: ${location}`);

  return callback(null, response);
};
