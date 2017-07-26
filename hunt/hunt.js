exports.handler = function(context, event, callback) {
  const numbers = context.PHONE_NUMBERS.split(',').map(number => number.trim());
  const response = new Twilio.twiml.VoiceResponse();
  if (event.DialCallStatus === 'complete') {
    // Call was answered and completed
    response.hangup();
  } else if (event.finished === 'true') {
    if (context.FINAL_URL) {
      response.redirect(context.FINAL_URL);
    } else {
      response.hangup();
    }
  } else {
    const numberToDial = event.nextNumber ? event.nextNumber : numbers[0];
    const currentNumberIndex = numbers.indexOf(numberToDial);
    let url;
    if (currentNumberIndex + 1 === numbers.length) {
      // No more numbers to call after this.
      url = '/hunt?finished=true';
    } else {
      const nextNumber = numbers[currentNumberIndex + 1];
      url = '/hunt?nextNumber=' + encodeURIComponent(nextNumber);
    }
    const dial = response.dial({ action: url });
    dial.number(numberToDial);
  }
  callback(null, response);
};
