# Echo Funlet

This Twilio Function is based on the [Twimlet of the same name][twimlet].

[twimlet]: https://www.twilio.com/labs/twimlets/echo

## Usage

It can be used as a drop-in replacement for the Twimlet, by using the URL
of the Twilio Function as a webhook with the same GET parameters.

Alternatively, it can be customized by setting properties in the
environment. GET and POST parameters are considered first, if provided,
then environment properties, then config properties declared in the script.

Environment properties are most convenient when you are using a single
instance of this script in your account. To customize multiple instances,
the recommended way is to modify the script parameters in the config object,
directly in the script.

## Stages

The Echo Funlet has a single stage:

| Stage | Addressing | Description |
| ----: | :--------- | :---------- |
|     1 | Caller     | Return Twilio instructions received in Twiml parameter |

## Input

### Twiml

Twiml instructions, as a text string.

1. Event: `Twiml` parameter
2. Context: `FUNLET_ECHO_TWIML` environment property
3. Script: `twiml` config property

## Output

This Twilio Function simply returns the TwiML instructions provided as input.
