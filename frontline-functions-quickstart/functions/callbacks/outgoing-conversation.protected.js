const getCustomerProxyAddress = (context, channelName) => {
  if (channelName === 'whatsapp') {
    return context.TWILIO_WHATSAPP_NUMBER;
  }
  return context.TWILIO_PHONE_NUMBER;
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

  callback(403, 'Proxy address not found');
};

exports.handler = async function (context, event, callback) {
  const location = event.Location;

  // Location helps to determine which action to perform.
  if (location === 'GetProxyAddress') {
    return handleGetProxyAddress(context, event, callback);
  }
  return callback(422, err);
};
