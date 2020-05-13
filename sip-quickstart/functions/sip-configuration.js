exports.handler = function(context, event, callback) {
    callback(null, {
        appName: context.APP_NAME,
        incomingNumber: context.INCOMING_NUMBER,
        callerId: context.CALLER_ID
    });
};