# Simulring Funlet

This Twilio Function is based on the [Twimlet of the same name][twimlet].

[twimlet]: https://www.twilio.com/labs/twimlets/simulring

It can be used as a drop-in replacement for the Twimlet, by using the URL
of the Twilio Function as a webhook with the same GET parameters.

Alternatively, it can be customized by setting properties in the
environment. GET and POST parameters are considered first, if provided,
then environment properties, then default values declared in the script.

Environment properties are most convenient when you are using a single
instance of this script in your account. To customize multiple instances,
the recommended way is to modify the default values in the script parameter
constants at the top of the script.

## Stages

The Simulring Funlet has four stages:

| Stage | Addressing | Description |
| ----: | :--------- | :---------- |
|     1 | Caller     | Forward incoming call to the first forwarding number that answers |
|     2 | Recipient  | Ask the recipient to press a key to accept the call |
|     3 | Recipient  | Bridge the call when a digit has been pressed |
|     4 | Caller     | After a failed call, redirect to fallback URL, if any |

These four stages would typically be implemented in four separate Twilio
Functions. In the Simulring Funlet, they are running in four separate
instances of the same Twilio Function. In the original Simulring Twimlet,
both stage 1 and stage 4 were implemented in the same script, while the
stages 2 and 3 were delegated to a separate script, the Whisper Twimlet.

## Input

### Phone Numbers

A list of text strings for all the forwarding phone numbers,
called simultaneously.

1. Event: a single `PhoneNumbers=` or a list of `PhoneNumbers[]=` parameters
2. Environment: up to five forwarding phone numbers,
  each in a separate environment property:
  - `FUNLET_SIMULRING_PHONE_NUMBER1`,
  - `FUNLET_SIMULRING_PHONE_NUMBER2`,
  - `FUNLET_SIMULRING_PHONE_NUMBER3`,
  - `FUNLET_SIMULRING_PHONE_NUMBER4`,
  - `FUNLET_SIMULRING_PHONE_NUMBER5`
3. Script: `MY_PHONE_NUMBERS` constant string or array of string values

### Fallback Url

Text string, fallback URL where further instructions are requested
when the forwarding call fails.

1. Event: `FailUrl` parameter
2. Environment: `FUNLET_SIMULRING_FALLBACK_URL` environment property
3. Script: `MY_FALLBACK_URL` constant

### Message

Text string, a recording URL or a text to say,
asking the recipient to press any key to accept the call.
*(A string starting with 'http' is considered to be a URL)*

1. Event: `Message` parameter
2. Environment: `FUNLET_SIMULRING_MESSAGE` environment property
3. Script: `MY_MESSAGE` constant

### Language

Text string, language code for text messages, e.g. 'en' or 'en-gb'.
Defaults to 'en': English with an American accent.

1. Event: `Language` parameter
2. Environment: `FUNLET_SIMULRING_LANGUAGE` environment property
3. Script: `MY_LANGUAGE` constant

### Voice

Text string, voice for text messages, one of 'man', 'woman' or 'alice'.
Defaults to 'alice', who speaks in a large selection languages.

1. Event: `Voice` parameter
2. Environment: `FUNLET_SIMULRING_VOICE` environment property
3. Script: `MY_VOICE` constant

### Timeout

Number, duration in seconds to let the call ring before the recipient picks up.

1. Event: `Timeout` parameter
2. Environment: `FUNLET_SIMULRING_TIMEOUT` environment property
3. Script: `MY_TIMEOUT` constant

### Dial Done (Stage 4)

Boolean, a flag set to true to bypass the first stage of processing
when returning from the call to the forwarding number.

1. Event: `Dial` parameter

### Call Status (Stage 4)

Text string, the status of the forwarding call.

1. Event: `DialCallStatus` or `DialStatus` property provided by `<Dial>`

## Output

This Twilio Function returns TwiML instructions for Twilio Voice.
