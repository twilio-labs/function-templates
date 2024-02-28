const detectMissingParams = (paramNames, event) => {
  const missingParams = paramNames.filter(
    (param) => !event.hasOwnProperty(param)
  );
  return missingParams.length > 0 ? missingParams : null;
};

const errorLogger = (error) => {
  if (error.response) {
    console.log('Client has given an error', error);
  } else if (error.request) {
    console.log('Runtime error', error);
  } else {
    console.log(error);
  }
};

module.exports = {
  detectMissingParams,
  errorLogger,
};
