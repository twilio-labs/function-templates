const auth = require('basic-auth');
const compare = require('tsscmp');

const isAuthenticated = (context, event) => {
  const { PASSCODE } = context;

  if (
    !event.request ||
    !event.request.headers ||
    !event.request.headers.authorization
  ) {
    return false;
  }

  const parsedCredentials = auth.parse(event.request.headers.authorization);
  if (!parsedCredentials) {
    return false;
  }

  const { name, pass } = parsedCredentials;
  let valid = true;

  // Simple method to prevent short-circut and use timing-safe compare
  valid = compare(name, 'admin') && valid;
  valid = compare(pass, PASSCODE) && valid;

  return valid;
};

module.exports = { isAuthenticated };
