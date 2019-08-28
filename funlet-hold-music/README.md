# Hold Music Funlet

This Twilio Function is based on the [Twimlet of the same name][twimlet].

[twimlet]: https://www.twilio.com/labs/twimlets/holdmusic

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

The Hold Music Funlet has a single stage:

| Stage | Addressing | Description |
| ----: | :--------- | :---------- |
|     1 | Caller     | Play hold music and messages, in a loop |

## Input

### Bucket

Text string, a public Amazon S3 bucket which contains a list of music files
to play, with the extension '.mp3', '.wav' or '.ul'.

1. Event: `Bucket` parameter
2. Environment: `FUNLET_HOLDMUSIC_BUCKET` environment property
3. Script: `bucket` config property

### Message

Text string, a recording URL or a text to say between songs.
*(A string starting with 'http' is considered to be a URL)*

1. Event: `Message` parameter
2. Environment: `FUNLET_HOLDMUSIC_MESSAGE` environment property
3. Script: `message` config property

### Language

Text string, language code for text messages, e.g. 'en' or 'en-gb'.
Defaults to 'en': English with an American accent.

1. Event: `Language` parameter
2. Environment: `FUNLET_HOLDMUSIC_LANGUAGE` environment property
3. Script: `language` config property

### Voice

Text string, voice for text messages, one of 'man', 'woman' or 'alice'.
Defaults to 'alice', who speaks in a large selection languages.

1. Event: `Voice` parameter
2. Environment: `FUNLET_HOLDMUSIC_VOICE` environment property
3. Script: `voice` config property

## Output

This Twilio Function returns TwiML instructions for Twilio Voice.
