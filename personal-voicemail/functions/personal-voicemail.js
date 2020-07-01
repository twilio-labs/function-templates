/**
 * Personal Voicemail.
 * 
 * See ReadMe for details on 
 * the configuration options.
 * 
 **/

/*****************************/
/******* configuration *******/

const options = {
    phoneNumber: '',
    defaultTimeout: 12,
    secureRecordingLinks: true,
    voiceOpts: {
        voice: 'alice',
        language: 'en-US'
    },
    voiceMailMessage: "Hello, I can not answer the phone right now. Please leave a message. Hang up when you're finished.",
    reject: [
        // To block a caller, add the E164 formatted number here
    ],
    rejectMessage: "You are calling from a restricted number. Goodbye."
}

/***** end configuration *****/
/*****************************/

exports.handler = function(context, event, callback) {
    const {
        phoneNumber,
        defaultTimeout,
        secureRecordingLinks,
        voiceOpts,
        voiceMailMessage,
        reject,
        rejectMessage
    } = options;

    const thisFunction = 'https://' + context.DOMAIN_NAME + context.PATH;
    const timeout = event.timeout || defaultTimeout;
    
    function shouldReject() {
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
    
    function handleInbound() {
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
    
    function startVoicemail() {
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
    
    function notifyVoicemail() {
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
    
    function redirect() {
        const twiml = new Twilio.twiml.VoiceResponse();
        twiml.redirect(thisFunction);
        return twiml;
    }

    function hangup() {
        const twiml = new Twilio.twiml.VoiceResponse();
        twiml.hangup();
        return twiml;
    }

    switch (true) {
        case event.CallStatus === 'queued':
            callback(null, redirect());
            break;
        case event.CallStatus === 'ringing':
            const rejectOrHandle = shouldReject() ? 
                                    rejectInbound() : 
                                    handleInbound();
            callback(null, rejectOrHandle);
            break;
        case ['canceled', 'busy', 'failed'].includes(event.CallStatus):
        case event.CallStatus === 'in-progress' && event.DialCallStatus === 'no-answer':
            callback(null, startVoicemail());
            break;
        case event.CallStatus === 'completed' && event.Digits === 'hangup':
            notifyVoicemail();
            break;
        default:
            callback(null, hangup());
    }
};

exports.options = options;
