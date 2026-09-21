const detectMissingParams = (paramNames, event) => {
  const missingParams = paramNames.filter(
    (param) => !event.hasOwnProperty(param)
  );
  return missingParams.length > 0 ? missingParams : null;
};

const isEmpty = (requestBody) => {
  return Object.keys(requestBody).length === 0;
};

/*
 * The demo page is served from the same domain, but the mobile SDKs and any
 * other origin listed in `assets/origins.js` call these endpoints cross-origin.
 */
const jsonResponse = () => {
  const response = new Twilio.Response();
  response.appendHeader('Content-Type', 'application/json');
  response.appendHeader('Access-Control-Allow-Origin', '*');
  response.appendHeader('Access-Control-Allow-Methods', 'OPTIONS, POST, GET');
  response.appendHeader('Access-Control-Allow-Headers', 'Content-Type');
  return response;
};

/*
 * The WebAuthn credential arrives as a nested object when posted as JSON, and
 * flattened when posted as form data.
 */
const credentialFrom = (event, responseFields) => {
  const credentialResponse =
    event.response ||
    Object.fromEntries(responseFields.map((field) => [field, event[field]]));

  return {
    id: event.id,
    rawId: event.rawId,
    authenticatorAttachment: event.authenticatorAttachment || 'platform',
    type: event.type || 'public-key',
    response: credentialResponse,
  };
};

module.exports = {
  detectMissingParams,
  isEmpty,
  jsonResponse,
  credentialFrom,
};
