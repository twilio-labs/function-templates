const detectMissingParams = (paramNames, event) => {
  const missingParams = paramNames.filter(
    (param) => !event.hasOwnProperty(param)
  );
  return missingParams.length > 0 ? missingParams : null;
};

const isEmpty = (requestBody) => {
  return Object.keys(requestBody).length === 0;
};

module.exports = {
  detectMissingParams,
  isEmpty,
};
