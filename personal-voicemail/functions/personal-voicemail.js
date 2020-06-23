/**
 * This is a fairly simple function to provide call forwarding with voicemail.
 *
 * To configure:
 *
 * - Required: Add your E164 formatted phone number to the `phoneNumber`
 *   variable. This is where incoming calls will be forwarded.
 *
 * - Optional: Alter the dial timeout. This is the amount of time that the
 *   function will allow your phone to ring before forwarding to voicemail.
 *
 * - Optional: If you have enabled authentication for your Media URLs then
 *   you will not be able to receive recordings directly via MMS. If you want
 *   to maintain your authenticated media urls then you can change the
 *   `secureRecordingLinks` value below to `false`. This will then send
 *   you voicemail notifications with a link to the Call record in the console.
 *
 * - Optional: Change the voice options for the Say verbs. See the docs for
 *   details: https://www.twilio.com/docs/voice/twiml/say#attributes-voice
 *
 * - Optional: Change the `voiceMailMessage` to something more your style.
 *   If this is a url to a recording then that recording will be played to
 *   the caller as a voicemail prompt.
 *
 * This function also contains a block list. Should you need to block a
 * caller you can add E164 formatted numbers to the list of numbers to reject.
 * For example:
 *
 *   let reject = [
 *     '+14151112222',
 *     '+14153334444'
 *   ]
 *
 *  You can optionally change the `rejectMessage` to customize what message
 *  will be delivered to a blocked caller. If you'd prefer not to notify
 *  callers when they are rejected then set the `rejectMessage` value to
 *  `false` to simply hang up on the caller.
 */

/*****************************/
/******* configuration *******/

const phoneNumber = '+17203089773';
const defaultTimeout = 12;

const secureRecordingLinks = false;

const voiceOpts = {
    'voice': 'alice',
    'language': 'en-US'
};

const voiceMailMessage = "Hello, I can not answer the phone right now. Please leave a message. Hang up when you're finished.";

const reject = [
    // To block a caller, add the E164 formatted number here
];

const rejectMessage = "You are calling from a restricted number. Goodbye.";

/***** end configuration *****/
/*****************************/

function shouldReject(event) {
    return reject.length > 0 && event.From && reject.includes(event.From);
}

function rejectInbound() {
    let twiml = new Twilio.twiml.VoiceResponse();
    if (rejectMessage) {
        twiml.say(rejectMessage, voiceOpts);
    }
    twiml.hangup();
    return twiml;
}

function handleInbound(event, thisFunction, timeout) {
    const dialParams = {
        'action': thisFunction + '?handle-voicemail'
    };

    if (event.CallerId) {
        dialParams.callerId = event.CallerId;
    }

    if (timeout) {
        dialParams.timeout = timeout;
    }

    const twiml = new Twilio.twiml.VoiceResponse();
    twiml.dial(dialParams, phoneNumber);

    return twiml;
}

function startVoicemail(thisFunction) {
    const twiml = new Twilio.twiml.VoiceResponse();

    const prompt = voiceMailMessage.trim();

    if (prompt.match(/^(https?:\/\/[^\s]+)$/)) {
        twiml.play(prompt);
    } else {
        twiml.say(prompt, voiceOpts);
    }

    twiml.record({
        action: thisFunction + '?notify-voicemail',
        timeout: '10'
    });

    return twiml;
}

function notifyVoicemail(event, context, callback) {
    const message = {
        to: phoneNumber,
        from: event.To,
        body: 'New voicemail from ' + event.From
    };

    if (secureRecordingLinks) {
        message.body += ' - https://www.twilio.com/console/voice/logs/calls/' + event.CallSid;
    } else {
        message.mediaUrl = event.RecordingUrl + '.mp3';
    }

    context.getTwilioClient().messages.create(message)
        .then(msg => callback(null, msg.sid))
        .catch(callback);
}

function redirect(thisFunction) {
    const twiml = new Twilio.twiml.VoiceResponse();
    twiml.redirect(thisFunction);
    return twiml;
}

exports.handler = function(context, event, callback) {
    const thisFunction = 'https://' + context.DOMAIN_NAME + '/personal-voicemail';
    const timeout = event.timeout || defaultTimeout;

    switch (true) {
        case event.CallStatus === 'queued':
            callback(null, redirect(thisFunction));
            break;
        case event.CallStatus === 'ringing':
            const rejectOrHandle = shouldReject(event) ? 
                                    rejectInbound() : 
                                    handleInbound(event, thisFunction, timeout);
            callback(null, rejectOrHandle);
            break;
        case ['canceled', 'busy', 'failed'].includes(event.CallStatus):
        case event.CallStatus === 'in-progress' && event.DialCallStatus === 'no-answer':
            callback(null, startVoicemail(thisFunction));
            break;
        case event.CallStatus === 'completed' && event.Digits === 'hangup':
            notifyVoicemail(event, context, callback);
            break;
        default:
            callback();
    }
};

exports.phoneNumber = phoneNumber;
exports.defaultTimeout = defaultTimeout;
exports.secureRecordingLinks = secureRecordingLinks;
exports.voiceOpts = voiceOpts;
exports.voiceMailMessage = voiceMailMessage;
exports.reject = reject;
exports.rejectMessage = rejectMessage;

exports.input = {
    // actions
    shouldReject: shouldReject,
    rejectInbound: rejectInbound,
    handleInbound: handleInbound,
    startVoicemail: startVoicemail,
    notifyVoicemail: notifyVoicemail,
    redirect: redirect,
    // config
    phoneNumber: phoneNumber,
    defaultTimeout: defaultTimeout,
    secureRecordingLinks: secureRecordingLinks,
    voiceOpts: voiceOpts,
    voiceMailMessage: voiceMailMessage,
    reject: reject,
    rejectMessage: rejectMessage,
};