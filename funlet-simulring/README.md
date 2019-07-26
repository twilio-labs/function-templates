# Simulring Funlet

This Twilio Function is based on the [Twimlet of the same name][twimlet].

[twimlet]: https://www.twilio.com/labs/twimlets/simulring

It can be used as a drop-in replacement for the Twimlet, with the
same GET parameters, by using the URL of the Twilio Function as
a webhook with the GET method.

Alternatively, it can be customized by setting properties in the
environment. GET or POST parameters are considered first, if provided,
then environment properties, then default values declared in the script.

Environment properties are most convenient when you are using a single
instance of this script in your account. To customize multiple instances,
the recommended way is to modify the default values directly in each copy
of the script.

You will find a separate accessor function for each parameter at the
beginning of the script, where you can change just these default value.
You may also rewrite these functions fully to better accommodate your needs.

## Input

### Phone Numbers

A list of text strings for all the forwarding phone numbers,
called simultaneously.

1. Event
  o GET: a single `PhoneNumbers=` or a list of `PhoneNumbers[]=` parameters
  o POST: `PhoneNumbers` string or array of string values
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

1. Event
  o GET: `FailUrl` parameter
  o POST: `FailUrl` property
2. Environment: `FUNLET_SIMULRING_FALLBACK_URL` environment property
3. Script: `MY_FALLBACK_URL` constant

### Message

Text string: a recording URL or a text to say,
asking the recipient to press any key to accept the call.
*(A string starting with 'http' is considered to be a URL)*

1. Event
  o GET: `Message` parameter
  o POST: `Message` property
2. Environment: `FUNLET_SIMULRING_MESSAGE` environment property
3. Script: `MY_MESSAGE` constant

### Timeout

Number: duration in seconds to let the call ring before the recipient picks up.

1. Event
  o GET: `Timeout` parameter
  o POST:  `Timeout` property
2. Environment: `FUNLET_SIMULRING_TIMEOUT` environment property
3. Script: `MY_TIMEOUT` constant

### Dial (Stage 2)

Stage 2: When the forwarded call ends.
Boolean, a flag set to true to bypass the first stage of processing
when returning from the call to the forwarding number.

1. Event
  o GET: `Dial` parameter

### Call Status (Stage 2)

Stage 2: When the forwarded call ends.
Text string, the status of the forwarding call.

1. Event
  o POST: `DialCallStatus` or `DialStatus` property provided by `<Dial>`

## Output

This Twilio Function returns TwiML instructions for Twilio Voice.
