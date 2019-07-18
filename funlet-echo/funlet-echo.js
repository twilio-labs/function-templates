const MY_TWIML = '<Response><Say>echo</Say></Response>';

exports.handler = function(context, event, callback) {
  callback(null, event.Twiml || context.ECHO_TWIML || MY_TWIML );
};
