const detectMissingParams = (paramNames, event) => {
  const missingParams = paramNames.filter(
    (param) => !event.hasOwnProperty(param)
  );
  return missingParams.length > 0 ? missingParams : null;
};

module.exports = {
  detectMissingParams,
};
