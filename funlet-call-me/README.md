# Call Me Funlet

This Twilio Function is based on the [Twimlet of the same name][twimlet].

[twimlet]: https://www.twilio.com/labs/twimlets/callme

It can be used as a drop-in replacement for the Twimlet, by using the URL
of the Twilio Function as a webhook with the same GET parameters.

Alternatively, it can be customized by setting properties in the
environment. GET and POST parameters are considered first, if provided,
then environment properties, then default values declared in the script.

Environment properties are most convenient when you are using a single
instance of this script in your account. To customize multiple instances,
the recommended way is to modify the default values in the script parameter
constants at the top of the script.

## Input

### Phone Number

Text string, the forwarding number.

1. Event: `PhoneNumber` parameter
2. Environment: `FUNLET_CALLME_PHONE_NUMBER` environment property
3. Script: `MY_PHONE_NUMBER` constant

### Fallback Url

Text string, fallback URL where further instructions are requested
when the forwarding call fails.

1. Event: `FailUrl` parameter
2. Environment: `FUNLET_CALLME_FALLBACK_URL` environment property
3. Script: `MY_FALLBACK_URL` constant

### Message

Text string: a recording URL or a text to say,
asking the recipient to press any key to accept the call.
*(A string starting with 'http' is considered to be a URL)*

1. Event: `Message` parameter
2. Environment: `FUNLET_CALLME_MESSAGE` environment property
3. Script: `MY_MESSAGE` constant

### Language

Text string, language code for text messages, e.g. 'en' or 'en-gb'.
Defaults to 'en': English with an American accent.

1. Event: `Language` parameter
2. Environment: `FUNLET_CALLME_LANGUAGE` environment property
3. Script: `MY_LANGUAGE` constant

### Voice

Text string, voice for text messages, one of 'man', 'woman' or 'alice'.
Defaults to 'alice', who speaks in a large selection languages.

1. Event: `Voice` parameter
2. Environment: `FUNLET_CALLME_VOICE` environment property
3. Script: `MY_VOICE` constant

### Timeout

Number: duration in seconds to let the call ring before the recipient picks up.

1. Event: `Timeout` parameter
2. Environment: `FUNLET_CALLME_TIMEOUT` environment property
3. Script: `MY_TIMEOUT` constant

### Dial Done (Stage 2)

Stage 2: When the forwarded call ends.
Boolean, a flag set to true to bypass the first stage of processing
when returning from the call to the forwarding number.

1. Event
  o GET: `Dial` parameter

### Call Status (Stage 2)

Stage 2: When the forwarded call ends.
Text string, the status of the forwarding call.

1. Event: `DialCallStatus` or `DialStatus` property provided by `<Dial>`

## Output

This Twilio Function returns TwiML instructions for Twilio Voice.
