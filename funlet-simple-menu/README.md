# Simple Menu Funlet

This Twilio Function is based on the [Twimlet of the same name][twimlet].

[twimlet]: https://www.twilio.com/labs/twimlets/menu

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

### Message

Text string: a recording URL or a text to say.
*(A string starting with 'http' is considered to be a URL)*

1. Event
  o GET: `Message` parameter
  o POST: `Message` property
2. Environment: `FUNLET_MENU_MESSAGE` environment property
3. Script: `MY_MESSAGE` constant

### Language

Text string, language code for text messages, e.g. 'en' or 'en-gb'.
Defaults to 'en': English with an American accent.

1. Event
  o GET: `Language` parameter
  o POST: `Language` property
2. Environment: `FUNLET_MENU_LANGUAGE` environment property
3. Script: `MY_LANGUAGE` constant

### Voice

Text string, voice for text messages, one of 'man', 'woman' or 'alice'.
Defaults to 'alice', who speaks in a large selection languages.

1. Event
  o GET: `Voice` parameter
  o POST: `Voice` property
2. Environment: `FUNLET_MENU_VOICE` environment property
3. Script: `MY_VOICE` constant

### Options

A list of action URLs to redirect to when the matching digits are input.
The digits are assigned by setting a custom key for the array index,
for example: `Options[42]=http://example.com/action` associates the
action URL `http://example.com/action` with the digits `42`.

Note that when no key is assigned, as in `Options[]=//example.com/action`, a
sequence of digits starting with 0, not 1, will be associated with each option.

1. Event
  o GET: a list of `Options[digits]=URL` parameters:
    e.g. `Options[1]=...&Options[2]=...&Options[101]=...`
    or a single `Options=URL` string parameter, associated with digit `0`.
  o POST: a list of `"Options[digits]": "URL"` properties
    or a single `Options` property with key/values for digits/URLs:
    ```
    "Options":{
      "1": "...",
      "2": "...",
      ...
      "101": "..."
    }
    ```
2. Environment: up to 10 action URL and matching digits,
  each in a separate environment property:
  - `FUNLET_MENU_OPTION1_URL` and `FUNLET_MENU_OPTION1_DIGITS`
  - `FUNLET_MENU_OPTION2_URL` and `FUNLET_MENU_OPTION2_DIGITS`
  - ...
  - `FUNLET_MENU_OPTION9_URL` and `FUNLET_MENU_OPTION9_DIGITS`
  - `FUNLET_MENU_OPTION0_URL` and `FUNLET_MENU_OPTION0_DIGITS`
3. Script: `MY_OPTIONS` constant with key/values for digits/URLs

### Digits (Stage 2)

Stage 2: When one or several digits have been pressed.
Text string, list of digits pressed.

1. Event
  o POST: `Digits` property provided by `<Gather>`

## Output

This Twilio Function returns TwiML instructions for Twilio Voice.
