let flowDefinition = require('../sms-studio-flow.json');

exports.handler = function(context, event, callback) {
	const twilioClient = context.getTwilioClient();

	twilioClient.studio.flows
             .create(flowDefinition)
             .then(flow => console.log(flow.sid));
};
