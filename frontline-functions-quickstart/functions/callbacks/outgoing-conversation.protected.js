/* eslint-disable camelcase */
const getCustomerProxyAddress = (context, channelName) => {
  if (channelName === 'whatsapp') {
    return context.TWILIO_WHATSAPP_NUMBER;
  }
  if (channelName === 'sms') {
    return context.TWILIO_PHONE_NUMBER;
  }
  return null;
};

const handleGetProxyAddress = (context, event, callback) => {
  const channelName = event.ChannelType;

  const proxyAddress = getCustomerProxyAddress(context, channelName);

  /**
   * In order to start a new conversation ConversationsApp need a proxy address
   *  otherwise the app doesn't know from which number send a message to a customer
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

exports.handler = async function (context, event, callback) {
  const location = event.Location;

  // Location helps to determine which action to perform.
  if (location === 'GetProxyAddress') {
    return handleGetProxyAddress(context, event, callback);
  }

  const response = new Twilio.Response();
  response.setStatusCode(422);
  response.setBody(`Unknown location: ${location}`);

  return callback(null, response);
};
