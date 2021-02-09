exports.handler = function(context, event, callback) {

    client = context.getTwilioClient();

    client.studio.v1.flows.list({limit: 20})
        .then(flows => flows.forEach(f => {
            if (f.friendlyName === "Vaccine Standby Intake") {
                callback(null, f.sid)
                return;
            }
            
            callback(null, 'none')
        }))
        .catch(err => callback(err));
};