const detectMissingParams = (paramNames, event) => {
  return paramNames.reduce((acc, param) => {
    if (typeof event[param] === 'undefined') {
      acc.push(param);
    }
    return acc;
  }, []);
};

const sortVerifications = (verifications) => {
  return verifications.sort((a, b) => {
    const aDate = new Date(a.verification_start_datetime);
    const bDate = new Date(b.verification_start_datetime);
    return bDate - aDate;
  });
};

module.exports = {
  detectMissingParams,
  sortVerifications,
};
