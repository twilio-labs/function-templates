exports.handler = async function(context, event, callback) {

    const client = context.getTwilioClient();
    const flowSid = context.FLOW_SID;

    client.studio.flows.list({limit: 100})
        .then(flows => {
            if (flows.length > 0) {
                flows.forEach(f => {
                    // Note: If you are running this app locally and you kill your dev server after creating
                    // the Studio Flow via the app, you will need to manually set FLOW_SID in your .env file
                    // before the next time you start your dev server.
                    if (f.sid === flowSid) {
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