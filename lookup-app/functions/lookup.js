exports.handler = function(context, event, callback) {

    checkCredentials(event, callback);

    const client = context.getTwilioClient();
    doLookup(client, event.phoneNumber, callback);
}

function checkCredentials(event, callback){

    if (!process.env.PAGE_TOKEN ||
        !event.pageToken ||
        !(event.pageToken === process.env.PAGE_TOKEN)){
            const response = new Twilio.Response();
            response.setStatusCode(401);
            response.setBody('unauthorized');
            callback(null, response);
        }
}

function doLookup(client, phoneNumber, callback){
    client.lookups.phoneNumbers(phoneNumber)
        .fetch({type: ['carrier']})
        .then(
            res => callback(null, res),
            err => {
                const response = new Twilio.Response();
                response.setStatusCode(404);
                response.setBody(err.message);
                callback(null, response);
            }
        );
}