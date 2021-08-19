exports.handler = async function (context, event, callback) {
  const { path } = Runtime.getFunctions().utils;
  const {
    getBaseUrl,
    getCurrentEnvironment,
    setEnvironmentVariable,
  } = require(path);
  const response = new Twilio.Response();

  try {
    if (
      !event['admin-phone-number'] ||
      !event['admin-password'] ||
      event['admin-phone-number'] !== context.ADMIN_PHONE_NUMBER ||
      event['admin-password'] !== context.ADMIN_PASSWORD
    ) {
      // eslint-disable-next-line no-undef
      response.setStatusCode(301);
      response.appendHeader(
        'Location',
        `${context.DOMAIN_NAME}/index.html?error=Unauthorized:%20check%20your%20admin%20phone%20number%20and%20admin%20password%20and%20try%20again.`
      );

      callback(null, response);
      return;
    }

    const environment = await getCurrentEnvironment(context);

    const promises = [];

    for (const property in event) {
      if (
        event[property] !== '' ||
        event[property !== undefined] ||
        complianceInformationNotChanged(property, event)
      ) {
        const envVarConvention = property.split('-').join('_').toUpperCase();
        promises.push(
          setEnvironmentVariable(
            context,
            environment,
            envVarConvention,
            event[property]
          )
        );
      }
    }

    Promise.all(promises)
      .then((values) => {
        response.setStatusCode(307);
        response.appendHeader(
          'Location',
          `${getBaseUrl(
            context
          )}/index.html?success=Sucessfully%20saved%20settings!`
        );

        callback(null, response);
      })
      .catch((err) => {
        response.setStatusCode(307);
        response.appendHeader(
          'Location',
          `${getBaseUrl(context)}/index.html?error=${err}`
        );
        callback(null, response);
      });
  } catch (err) {
    response.setStatusCode(307);
    response.appendHeader(
      'Location',
      `${getBaseUrl(context)}/index.html?error=${err}`
    );

    // eslint-disable-next-line callback-return
    callback(null, response);
  }
};
