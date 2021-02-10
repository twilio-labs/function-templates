exports.handler = function(context, event, callback) {

    const client = context.getTwilioClient();

    client.studio.flows.list({limit: 20})
        .then(flows => {
            if (flows.length > 0) {
                flows.forEach(f => {
                    if (f.friendlyName === "Vaccine Standby Intake") {
                        callback(null, f.sid)
                        return;
                    }
                    callback(null, 'none')
                });
            } else {
                callback(null, 'none');
            }
        })
        .catch(err => callback(err));

};