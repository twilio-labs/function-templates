exports.handler = async function(context, event, callback) {
    if (context.DOMAIN_NAME && context.DOMAIN_NAME.startsWith("localhost")) {
        return;
    }
    const client = context.getTwilioClient();
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
            return {
                environment,
                "twilioPhoneNumber": context.TWILIO_PHONE_NUMBER
            }
        }
    }
}
