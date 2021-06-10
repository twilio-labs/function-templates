exports.handler = async function(context, event, callback) {
  console.log(event);

  const path = Runtime.getFunctions()['utils'].path;
  const { getBaseUrl, getCurrentEnvironment, setEnvironmentVariable } = require(path);

  let response = new Twilio.Response();
  const redirectBaseUrl = getBaseUrl(context);
  const client = context.getTwilioClient();

  if (!event['admin-phone-number'] ||
      !event['admin-password'] ||
      event['admin-phone-number'] !== context.ADMIN_PHONE_NUMBER ||
      event['admin-password'] !== context.ADMIN_PASSWORD) {
    // eslint-disable-next-line no-undef
    response.setStatusCode(301)
    response.appendHeader('Location', `${redirectBaseUrl}/index.html?error=Unauthorized:%20check%20your%20admin%20phone%20number%20and%20admin%20password%20and%20try%20again.`);

    callback(null, response);
    return;
  }

  try {
    const environment = await getCurrentEnvironment(context);

    let promises = [];

    for (const property in event) {
      if (event[property] !== '' || event[property !== undefined]) {
        let envVarConvention = property.split('-').join('_').toUpperCase();
        promises.push(setEnvironmentVariable(context, environment, envVarConvention, event[property]));
      }
    }
    
    Promise.all(promises)
      .then(values => {
        response.setStatusCode(307);
        response.appendHeader('Location', `${redirectBaseUrl}/index.html?success=Sucessfully%20saved%20settings!`);

        callback(null, response)
      })
      .catch(err => {
        response.setStatusCode(307);
        response.appendHeader('Location', `${redirectBaseUrl}/index.html?error=${err}`);
        callback(null, response);
      });
      
  } catch (err) {
    response.setStatusCode(307)
    response.appendHeader('Location', `${redirectBaseUrl}/index.html?error=${err}`);
    callback(null, response);
    return;
  }
}