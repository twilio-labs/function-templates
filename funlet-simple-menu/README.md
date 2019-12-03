# Simple Menu Funlet

This Twilio Function is based on the [Twimlet of the same name][twimlet].

[twimlet]: https://www.twilio.com/labs/twimlets/menu

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

The Simple Menu Funlet has two stages:

| Stage | Addressing | Description |
| ----: | :--------- | :---------- |
|     1 | Caller     | Welcome the caller and gather digits |
|     2 | Caller     | Redirect to the matching option, if any |

These two stages would typically be implemented in two separate Twilio
Functions. In the Simple Menu Funlet, they are running in two separate
instances of the same Twilio Function. This is in line with the original
Simple Menu Twimlet, which implemented both stages in the same script.

## Input

### Message

Text string, a recording URL or a text to say.
*(A string starting with 'http' is considered to be a URL)*

1. Event: `Message` parameter
2. Environment: `FUNLET_MENU_MESSAGE` environment property
3. Script: `message` config property

### Error Message (Stage 2)

Text string, a recording URL or a text to say when the digits pressed
do not match any option. For a text message, the same language and voice
will be used as for the message in stage 1.

1. Event: `ErrorMessage` parameter
2. Environment: `FUNLET_MENU_ERROR_MESSAGE` environment property
3. Script: `errorMessage` config property

### Language

Text string, language code for text messages, e.g. 'en' or 'en-gb'.
Defaults to 'en': English with an American accent.

1. Event: `Language` parameter
2. Environment: `FUNLET_MENU_LANGUAGE` environment property
3. Script: `language` config property

### Voice

Text string, voice for text messages, one of 'man', 'woman' or 'alice'.
Defaults to 'alice', who speaks in a large selection languages.

1. Event: `Voice` parameter
2. Environment: `FUNLET_MENU_VOICE` environment property
3. Script: `voice` config property

### Options

A list of action URLs to redirect to when the matching digits are input.
The digits are assigned by setting a custom key for the array index,
for example: `Options[42]=http://example.com/action` associates the
action URL `http://example.com/action` with the digits `42`.

Note that when no key is assigned, as in `Options[]=//example.com/action`, a
sequence of digits starting with 0, not 1, will be associated with each option.

1. Event: a list of `Options[digits]=URL` parameters:
   e.g. `Options[1]=...&Options[2]=...&Options[101]=...`
   or a single `Options=URL` string parameter, associated with digit `0`.
2. Environment: up to 10 action URL and matching digits,
  each in a separate environment property:
  - `FUNLET_MENU_OPTION1_URL` and `FUNLET_MENU_OPTION1_DIGITS`
  - `FUNLET_MENU_OPTION2_URL` and `FUNLET_MENU_OPTION2_DIGITS`
  - ...
  - `FUNLET_MENU_OPTION9_URL` and `FUNLET_MENU_OPTION9_DIGITS`
  - `FUNLET_MENU_OPTION0_URL` and `FUNLET_MENU_OPTION0_DIGITS`
  If the environment property for an option URL is set without the
  environment property for the matching digits, the digits default
  to the number of the option: 1, 2, ..., 9, 0.
3. Script: `options` config property with key/values for digits/URLs

### Digits (Stage 2)

Text string, list of digits pressed.

1. Event: `Digits` property provided by `<Gather>`

## Output

This Twilio Function returns TwiML instructions for Twilio Voice.
