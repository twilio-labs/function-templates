class VerificationException extends Error {
  constructor(status, message) {
    super(`Error ${status}: ${message}`);

    this.status = status;
    this.message = message;
  }
}

function detectMissingParams(paramNames, event) {
  return paramNames.reduce((acc, param) => {
    if (typeof event[param] === 'undefined') {
      acc.push(param);
    }
    return acc;
  }, []);
}

module.exports = {
  VerificationException,
  detectMissingParams,
};
