# Forward Funlet

This Twilio Function is based on the [Twimlet of the same name][twimlet].

[twimlet]: https://www.twilio.com/labs/twimlets/forward

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

The Forward Funlet has two stages:

| Stage | Addressing | Description |
| ----: | :--------- | :---------- |
|     1 | Caller     | Check that caller is allowed and forward the call |
|     2 | Caller     | After a failed call, redirect to fallback URL, if any |

These two stages would typically be implemented in two separate Twilio
Functions. In the Forward Funlet, they are running in two separate
instances of the same Twilio Function. This is in line with the original
Forward Twimlet, which implemented both stages in the same script.

## Input

### Phone Number

Text string, the forwarding number.

1. Event: `PhoneNumber` parameter
2. Environment: `FUNLET_FORWARD_PHONE_NUMBER` environment property
3. Script: `MY_PHONE_NUMBER` constant

### Caller ID

Text string, one of the verified phone numbers of your account
that you want to appear as caller ID for the forwarded call.

1. Event: `CallerId` parameter
2. Environment: `FUNLET_FORWARD_CALLER_ID` environment property
3. Script: `MY_CALLER_ID` constant

### Fallback Url

Text string, fallback URL where further instructions are requested
when the forwarding call fails.

1. Event: `FailUrl` parameter
2. Environment: `FUNLET_FORWARD_FALLBACK_URL` environment property
3. Script: `MY_FALLBACK_URL` constant

### Timeout

Number, duration in seconds to let the call ring before the recipient picks up.

1. Event: `Timeout` parameter
2. Environment: `FUNLET_FORWARD_TIMEOUT` environment property
3. Script: `MY_TIMEOUT` constant

### Allowed Callers

A list of text strings with the only phone numbers of callers that will be
allowed to be forwarded.

1. Event: a single `AllowedCallers=` or a list of `AllowedCallers[]=` parameters
2. Environment: up to five allowed callers,
  each in a separate environment property:
  - `FUNLET_FORWARD_ALLOWED_CALLER1`,
  - `FUNLET_FORWARD_ALLOWED_CALLER2`,
  - `FUNLET_FORWARD_ALLOWED_CALLER3`,
  - `FUNLET_FORWARD_ALLOWED_CALLER4`,
  - `FUNLET_FORWARD_ALLOWED_CALLER5`
3. Script: `MY_ALLOWED_CALLERS` array of string values

### Access Restricted Error Message

Text string, a recording URL or a text to say when the calling number
is not one of the allowed callers configured.

1. Event: `AccessRestricted`
2. Environment: `FUNLET_FORWARD_ACCESS_RESTRICTED` environment property
3. Script: `MY_ACCESS_RESTRICTED` constant

### Language

Text string, language code for text messages, e.g. 'en' or 'en-gb'.
Defaults to 'en': English with an American accent.

1. Event: `Language` parameter
2. Environment: `FUNLET_FORWARD_LANGUAGE` environment property
3. Script: `MY_LANGUAGE` constant

### Voice

Text string, voice for text messages, one of 'man', 'woman' or 'alice'.
Defaults to 'alice', who speaks in a large selection languages.

1. Event: `Voice` parameter
2. Environment: `FUNLET_FORWARD_VOICE` environment property
3. Script: `MY_VOICE` constant

### Caller

Text string, the caller's phone number.

1. Event: `From` or `Caller` property provided by the Twilio Voice event

### Phone Number Called

Text string, the Twilio phone number called for the forwarding.

1. Event: `To` or `Called` property provided by the Twilio Voice event

### Dial Done (Stage 2)

Boolean, a flag set to true to bypass the first stage of processing
when returning from the call to the forwarding number.

1. Event: `Dial` parameter

### Call Status (Stage 2)

Text string, the status of the forwarding call.

1. Event: `DialCallStatus` or `DialStatus` property provided by `<Dial>`

## Output

This Twilio Function returns TwiML instructions for Twilio Voice.
