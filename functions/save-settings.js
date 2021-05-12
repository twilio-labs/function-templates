exports.handler = async function(context, event, callback) {
  console.log(event);
  const client = context.getTwilioClient();

  async function getEnvironmentVariables(context, environment) {
    const client = context.getTwilioClient();
    return await client.serverless
      .services(environment.serviceSid)
      .environments(environment.sid)
      .variables.list();
  }
  
  async function getEnvironmentVariable(context, environment, key) {
    const client = context.getTwilioClient();
    // The list filter method isn't implemented yet.
    const envVars = await getEnvironmentVariables(context, environment);
    return envVars.find(variable => variable.key === key);
  }

  async function getCurrentEnvironment(context) {
    if (context.DOMAIN_NAME && context.DOMAIN_NAME.startsWith("localhost")) {
      return;
    }
    const services = await client.serverless.services.list();
    for (let service of services) {
      const environments = await client.serverless
        .services(service.sid)
        .environments.list();
      const environment = environments.find(
        env => env.domainName === context.DOMAIN_NAME
      );
      if (environment) {
        // Exit the function
        return environment;
      }
    }
  }

  async function setEnvironmentVariable(context, environment, key, value, override=true) {

    try {
      const currentVariable = await getEnvironmentVariable(
        context,
        environment,
        key
      );
      if (currentVariable) {
        if (currentVariable.value !== value) {
          if (override) {
            console.log(`Updating ${key}...`);
            await currentVariable.update({ value });
            return true;
          } else {
            console.log(`Not overriding existing variable '${key}' which is set to '${currentVariable.value}'`);
            return false;
          }
        } else {
          console.warn(`Variable '${key}' was already set to '${value}'`);
          return false;
        }
      } else {
        console.log(`Creating variable ${key}`);
        await client.serverless
          .services(environment.serviceSid)
          .environments(environment.sid)
          .variables.create({
            key,
            value
          });
      }
    } catch (err) {
      console.error(`Error creating '${key}' with '${value}': ${err}`);
      return false;
    }
    return true;
  }

  const environment = await getCurrentEnvironment(context);
  
  let promises = [];

  for (const property in event) {

    let envVarConvention = property.split('-').join('_').toUpperCase();
    promises.push(setEnvironmentVariable(context, environment, envVarConvention, event[property]));
  }
  
  Promise.all(promises)
    .then(values => callback(null, values))
    .catch(err => callback(err));
}