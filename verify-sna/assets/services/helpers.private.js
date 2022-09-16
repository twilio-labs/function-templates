const countryCodeField = 'countryCode';
const phoneNumberField = 'phoneNumber';

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
    const aDate = new Date(a.dateCreated);
    const bDate = new Date(b.dateCreated);
    return bDate - aDate;
  });
};

module.exports = {
  detectMissingParams,
  sortVerifications,
  countryCodeField,
  phoneNumberField,
};
