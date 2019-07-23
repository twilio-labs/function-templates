# Echo Funlet

This Twilio Function is based on the [Twimlet of the same name][twimlet].

[twimlet]: https://www.twilio.com/labs/twimlets/echo

## Usage

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

### Twiml

Twiml instructions, as a text string.

1. Event
  o GET: `Twiml` parameter
  o POST: `Twiml` property
2. Context: `FUNLET_ECHO_TWIML` environment property
3. Script: `MY_TWIML` constant

## Output

This Twilio Function simply returns the TwiML instructions provided as input.
