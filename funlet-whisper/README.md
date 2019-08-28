# Whisper Funlet

This Twilio Function is based on the undocumented Twimlet of the same name
(`whisper.php`).

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

The Whisper Funlet has two stages:

| Stage | Addressing | Description |
| ----: | :--------- | :---------- |
|     1 | Recipient  | Ask recipient to press a key to accept the call |
|     2 | Recipient  | Bridge the call when a digit has been pressed |

These two stages would typically be implemented in two separate Twilio
Functions. In the Whisper Funlet, they are running in two separate
instances of the same Twilio Function. This is in line with the original
Whisper Twimlet, which implemented both stages in the same script.

## Input

### Message

Text string, a recording URL or a text to say.
*(A string starting with 'http' is considered to be a URL)*

1. Event: `Message` parameter
2. Environment: `FUNLET_WHISPER_MESSAGE` environment property
3. Script: `message` config property

### Language

Text string, language code for text messages, e.g. 'en' or 'en-gb'.
Defaults to 'en': English with an American accent.

1. Event: `Language` parameter
2. Environment: `FUNLET_WHISPER_LANGUAGE` environment property
3. Script: `language` config property

### Voice

Text string, voice for text messages, one of 'man', 'woman' or 'alice'.
Defaults to 'alice', who speaks in a large selection languages.

1. Event: `Voice` parameter
2. Environment: `FUNLET_WHISPER_VOICE` environment property
3. Script: `voice` config property

### Human Check

Boolean, defaults to false. Whether to request the recipient to press
a key to accept the call explicitly.

1. Event: `HumanCheck` parameter
2. Environment: `FUNLET_WHISPER_HUMAN_CHECK` environment property
3. Script: `humanCheck` config property

### Digits (Stage 2)

Text string, list of digits pressed.

1. Event: `Digits` property provided by `<Gather>`

## Output

This Twilio Function returns TwiML instructions for Twilio Voice.
