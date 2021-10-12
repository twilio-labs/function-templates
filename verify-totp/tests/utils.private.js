function detectMissingParams(paramNames, event) {
  return paramNames.reduce((acc, param) => {
    if (typeof event[param] === 'undefined') {
      acc.push(param);
    }
    return acc;
  }, []);
}

module.exports = {
  detectMissingParams,
};
